import { ShinkaiNameWrapper } from "./ShinkaiNameWrapper";
import { test } from "vitest";

test("ShinkaiNameWrapper", () => {
  const validNames = [
    "@@alice.shinkai",
    "@@alice.shinkai/profileName",
    "@@alice.shinkai/profileName/agent/myChatGPTAgent",
    "@@alice.shinkai/profileName/device/myPhone",
  ];

  const invalidNames = [
    "@@alice.shinkai/profileName/myPhone",
    "@@al!ce.shinkai",
    "@@alice.shinkai//",
    "@@node1.shinkai/profile_1.shinkai",
  ];

  for (const name of validNames) {
    const wrapper = new ShinkaiNameWrapper(name);
    expect(wrapper.get_full_name).toBe(name.toLowerCase());
  }

  for (const name of invalidNames) {
    expect(() => new ShinkaiNameWrapper(name)).toThrow();
  }
});

test("ShinkaiNameWrapper get_profile_name", () => {
  const namesWithProfiles = [
    {
      name: "@@alice.shinkai/profileName",
      profile: "@@alice.shinkai/profileName",
    },
    {
      name: "@@alice.shinkai/profileName/agent/myChatGPTAgent",
      profile: "@@alice.shinkai/profileName",
    },
    {
      name: "@@alice.shinkai/profileName/device/myPhone",
      profile: "@@alice.shinkai/profileName",
    },
  ];

  for (const { name, profile } of namesWithProfiles) {
    const wrapper = new ShinkaiNameWrapper(name);
    expect(wrapper.extract_profile().get_full_name).toBe(profile.toLowerCase());
  }
});
