use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use cpal::BackendSpecificError;
use std::convert::TryInto;
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::{Duration, Instant};
use webrtc_vad::Vad;
use whisper_rs::{FullParams, SamplingStrategy, WhisperContext};

pub fn run<T>(
    device: &cpal::Device,
    config: cpal::StreamConfig,
    err_fn: fn(cpal::StreamError),
    is_activated: Arc<Mutex<bool>>,
    ctx: Arc<Mutex<WhisperContext>>,
) where
    T: cpal::Sample + cpal::SizedSample + Into<f32>,
{
    // Testing code to check that the audio capture is working
    let spec = hound::WavSpec {
        channels: 1,
        sample_rate: config.sample_rate.0,
        bits_per_sample: 32,
        sample_format: hound::SampleFormat::Float,
    };
    let mut writer = hound::WavWriter::create("../../output.wav", spec).unwrap();
    let config_clone = config.clone();

    // Create a buffer to accumulate audio data
    let buffer = Arc::new(Mutex::new(Vec::new()));

    // Initialize the VAD
    let vad = Arc::new(Mutex::new(Vad::new(config.sample_rate.0.try_into().unwrap()).unwrap()));
    vad.lock()
        .unwrap()
        .fvad_set_mode(webrtc_vad::VadMode::VeryAggressive)
        .unwrap();

    println!("Selected input device: {}", device.name().unwrap());
    let mut start_time = None;
    let mut last_voice_activity = None;

    // Normal Code
    let stream = device
        .build_input_stream(
            &config_clone,
            move |data: &[T], _: &cpal::InputCallbackInfo| {
                // Convert the incoming audio data to f32 and add it to the buffer
                let mut buffer = buffer.lock().unwrap();
                buffer.extend(data.iter().map(|sample| (*sample).into()));

                let mut is_activated = is_activated.lock().unwrap();
                let mut vad = Vad::new(config.sample_rate.0.try_into().unwrap()).unwrap();
                vad.fvad_set_mode(webrtc_vad::VadMode::VeryAggressive).unwrap();

                // print buffer length
                // println!("Buffer length: {}", buffer.len());
                if !buffer.is_empty() && buffer.len() >= 480 {
                    // println!("Buffer length: {}", buffer.len());
                    let buffer_i16: Vec<i16> = buffer.iter().map(|&f| (f * i16::MAX as f32) as i16).collect();
                    let is_voice = vad.is_voice_segment(&buffer_i16[(buffer.len() - 480)..]).unwrap();
                    // println!("Is voice: {}", is_voice);

                    if is_voice {
                        last_voice_activity = Some(Instant::now());
                        if !*is_activated {
                            // Start recording
                            *is_activated = true;
                            start_time = Some(Instant::now());
                            println!("Started recording");
                        }
                    } else if let Some(last_voice_activity) = last_voice_activity {
                        if last_voice_activity.elapsed() > Duration::from_secs_f32(1.0) && *is_activated {
                            // Stop recording
                            *is_activated = false;
                            if let Some(start_time) = start_time {
                                let duration = start_time.elapsed();
                                println!("Stopped recording after {} seconds", duration.as_secs());

                                // Process the audio data here
                                let buffer_clone = buffer.clone();
                                for sample in buffer_clone {
                                    let sample_f32: f32 = sample.into();
                                    writer.write_sample(sample_f32).unwrap();
                                }
                                let ctx = ctx.lock().unwrap();
                                let mut state = ctx.create_state().expect("failed to create state");

                                let mut params = FullParams::new(SamplingStrategy::Greedy { best_of: 1 });
                                params.set_n_threads(2);
                                params.set_print_special(false);
                                params.set_print_progress(false);
                                params.set_print_realtime(false);
                                params.set_print_timestamps(false);

                                let audio_data = whisper_rs::convert_stereo_to_mono_audio(&buffer).unwrap();

                                state.full(params, &audio_data).expect("failed to run model");

                                let num_segments = state.full_n_segments().expect("failed to get number of segments");
                                for i in 0..num_segments {
                                    let segment = state.full_get_segment_text(i).expect("failed to get segment");
                                    println!("Segment {}: {}", i, segment);

                                    let start_timestamp = state
                                        .full_get_segment_t0(i)
                                        .expect("failed to get segment start timestamp");
                                    let end_timestamp = state
                                        .full_get_segment_t1(i)
                                        .expect("failed to get segment end timestamp");
                                    println!("[{} - {}]: {}", start_timestamp, end_timestamp, segment);
                                }

                                // Clear the buffer
                                buffer.clear();

                                // Reset the is_activated flag
                                *is_activated = false;
                            }
                        }
                    }
                }
            },
            err_fn,
            None,
        )
        .unwrap();
    stream.play().unwrap();
    loop {
        std::thread::sleep(std::time::Duration::from_millis(100));
    }
}
