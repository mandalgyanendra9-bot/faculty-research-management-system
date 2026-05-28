const Department = require("../models/Department");
const Lookup = require("../models/Lookup");

const DEFAULT_DEPARTMENTS = [
  { name: "Computer Science and Engineering", code: "CSE", school: "Engineering" },
  { name: "Electronics and Communication", code: "ECE", school: "Engineering" },
  { name: "Mechanical Engineering", code: "MECH", school: "Engineering" },
  { name: "Civil Engineering", code: "CIVIL", school: "Engineering" },
  { name: "Electrical Engineering", code: "EEE", school: "Engineering" },
  { name: "Information Technology", code: "IT", school: "Engineering" },
];

const DEFAULT_DESIGNATIONS = [
  "Assistant Professor",
  "Associate Professor",
  "Professor",
  "Research Scholar",
  "Lab Instructor",
];

const ensureRegistrationDefaults = async () => {
  await Promise.all(
    DEFAULT_DEPARTMENTS.map((dept) =>
      Department.findOneAndUpdate(
        { code: dept.code },
        { $setOnInsert: dept },
        {
          upsert: true,
          setDefaultsOnInsert: true,
          runValidators: true,
        }
      )
    )
  );

  await Promise.all(
    DEFAULT_DESIGNATIONS.map((value) =>
      Lookup.findOneAndUpdate(
        { type: "designation", value },
        { $setOnInsert: { type: "designation", value, isActive: true } },
        {
          upsert: true,
          setDefaultsOnInsert: true,
          runValidators: true,
        }
      )
    )
  );
};

module.exports = {
  DEFAULT_DEPARTMENTS,
  DEFAULT_DESIGNATIONS,
  ensureRegistrationDefaults,
};
