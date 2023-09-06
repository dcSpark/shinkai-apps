import { JobCreationWrapper } from './JobCreationWrapper';

const jobCreationJson = `{
    "scope": {
        "buckets": ["inbox::@@node.shinkai::true", "job_inbox::my_job::false"],
        "documents": ["doc1", "doc2"]
    }
}`;

describe('JobCreationWrapper', () => {
//   it('should correctly convert from and to JSON string', () => {
//     const wrapper = JobCreationWrapper.from_json_str(jobCreationJson);
//     const jsonString = wrapper.to_json_str();

//     expect(JSON.parse(jsonString)).toEqual(JSON.parse(jobCreationJson));
//   });

//   it('should correctly convert from and to JsValue string', () => {
//     let jobCreation = JSON.parse(jobCreationJson);
//     const wrapper = JobCreationWrapper.from_jsvalue(jobCreation);
//     const jsonString = wrapper.to_json_str();

//     expect(JSON.parse(jsonString)).toEqual(JSON.parse(jobCreationJson));
//   });

//   it('should correctly instantiate it from a JobCreation Typescript object', () => {
//     let jobCreation: any = JSON.parse(jobCreationJson);
//     const wrapper = JobCreationWrapper.from_jsvalue(jobCreation);
//     const jsonString = wrapper.to_json_str();

//     expect(JSON.parse(jsonString)).toEqual(JSON.parse(jobCreationJson));
//   });

  it('should correctly instantiate an empty JobCreationWrapper', () => {
    const wrapper = JobCreationWrapper.empty();
    const jsonString = wrapper.to_json_str();

    expect(JSON.parse(jsonString)).toEqual({
        scope: {
            buckets: [],
            documents: []
        }
    });
  });
});