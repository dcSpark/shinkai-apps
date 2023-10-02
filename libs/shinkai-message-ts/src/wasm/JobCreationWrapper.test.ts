import { JobCreationWrapper } from './JobCreationWrapper';

const jobCreationJson = `{
    "scope": {
        "database": [],
        "local": []
    }
}`;

describe('JobCreationWrapper', () => {
  it('should correctly convert from and to JSON string', () => {
    const wrapper = JobCreationWrapper.from_json_str(jobCreationJson);
    const jsonString = wrapper.to_json_str();

    expect(JSON.parse(jsonString)).toEqual(JSON.parse(jobCreationJson));
  });

  it('should correctly convert from and to JsValue string', () => {
    const jobCreation = JSON.parse(jobCreationJson);
    const wrapper = JobCreationWrapper.from_jsvalue(jobCreation);
    const jsonString = wrapper.to_json_str();

    expect(JSON.parse(jsonString)).toEqual(JSON.parse(jobCreationJson));
  });

  it('should correctly instantiate it from a JobCreation Typescript object', () => {
    const jobCreation: any = JSON.parse(jobCreationJson);
    const wrapper = JobCreationWrapper.from_jsvalue(jobCreation);
    const jsonString = wrapper.to_json_str();

    expect(JSON.parse(jsonString)).toEqual(JSON.parse(jobCreationJson));
  });

  it('should correctly instantiate an empty JobCreationWrapper', () => {
    const wrapper = JobCreationWrapper.empty();
    const jsonString = wrapper.to_json_str();

    expect(JSON.parse(jsonString)).toEqual({
        scope: {
            database: [],
            local: []
        }
    });
  });
});
