use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LogEntry {
    pub timestamp: i64,
    pub process: String,
    pub message: String,
}

pub struct Logger {
    max_logs_length: usize,
    process_name: String,
    logs: Vec<LogEntry>,
}

impl Logger {
    pub(crate) fn new(max_logs_length: usize, process_name: String) -> Self {
        Logger {
            max_logs_length,
            process_name,
            logs: Vec::with_capacity(max_logs_length),
        }
    }

    fn build_log_entry(&mut self, message: String) -> LogEntry {
        let current_timestamp = chrono::Utc::now().timestamp();
        LogEntry {
            timestamp: current_timestamp,
            process: self.process_name.clone(),
            message: message.chars().filter(|&c| !c.is_control()).collect(),
        }
    }

    pub fn add_log(&mut self, message: String) -> LogEntry {
        let log_entry = self.build_log_entry(message);
        if self.logs.len() == self.max_logs_length {
            self.logs.remove(0);
        }
        self.logs.push(log_entry.clone());
        println!("{:?}", log_entry);
        log_entry
    }

    pub fn get_last_n_logs(&self, n: usize) -> Vec<LogEntry> {
        let parsed_logs: Vec<LogEntry> = if n >= self.logs.len() {
            self.logs.clone()
        } else {
            self.logs.as_slice()[self.logs.len() - n..].to_vec()
        };
        parsed_logs
            .into_iter()
            .filter(|value| !value.message.is_empty())
            .collect()
    }
}
