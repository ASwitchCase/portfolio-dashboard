import { formatDate, formatDateTime, fromDateInputValue, toDateInputValue } from "../lib/dates";

// Each resource describes everything the generic list/form pages need to
// drive themselves: where to fetch it, how to render it in a table, which
// fields to edit, and how to translate between API JSON and form state.
// This keeps Skills/PortfolioProjects/WorkExperiences/Educations/Contacts
// as data rather than five near-identical page components.

const skills = {
  key: "skills",
  path: "/api/skills",
  label: "Skill",
  labelPlural: "Skills",
  supportsCreate: true,
  supportsUpdate: true,
  supportsDelete: true,
  columns: [
    { key: "name", label: "Name" },
    { key: "createdAt", label: "Created", render: (item) => formatDate(item.createdAt) },
  ],
  fields: [{ name: "skillName", label: "Name", type: "text", required: true, maxLength: 200 }],
  toFormValues: (item) => ({ skillName: item?.name ?? "" }),
  toRequestBody: (values) => ({ skillName: values.skillName.trim() }),
};

const portfolioProjects = {
  key: "portfolioprojects",
  path: "/api/portfolioprojects",
  label: "Project",
  labelPlural: "Portfolio Projects",
  supportsCreate: true,
  supportsUpdate: true,
  supportsDelete: true,
  columns: [
    { key: "title", label: "Title" },
    { key: "spec", label: "Spec" },
    { key: "createdAt", label: "Created", render: (item) => formatDate(item.createdAt) },
  ],
  fields: [
    { name: "title", label: "Title", type: "text", required: true, maxLength: 200 },
    { name: "spec", label: "Spec", type: "textarea", required: true, maxLength: 500 },
    { name: "detail", label: "Detail", type: "textarea", required: true },
    { name: "skillIds", label: "Skills", type: "skills" },
  ],
  toFormValues: (item) => ({
    title: item?.title ?? "",
    spec: item?.spec ?? "",
    detail: item?.detail ?? "",
    skillIds: item?.skillIds ?? [],
  }),
  toRequestBody: (values) => ({
    title: values.title.trim(),
    spec: values.spec.trim(),
    detail: values.detail.trim(),
    skillIds: values.skillIds ?? [],
  }),
};

const workExperiences = {
  key: "workexperiences",
  path: "/api/workexperiences",
  label: "Work Experience",
  labelPlural: "Work Experience",
  supportsCreate: true,
  supportsUpdate: true,
  supportsDelete: true,
  columns: [
    { key: "company", label: "Company" },
    { key: "title", label: "Title" },
    { key: "location", label: "Location" },
    { key: "startDate", label: "Start", render: (item) => formatDate(item.startDate) },
    { key: "endDate", label: "End", render: (item) => (item.endDate ? formatDate(item.endDate) : "Present") },
  ],
  fields: [
    { name: "company", label: "Company", type: "text", required: true, maxLength: 200 },
    { name: "title", label: "Title", type: "text", required: true, maxLength: 200 },
    { name: "location", label: "Location", type: "text", required: true, maxLength: 200 },
    { name: "startDate", label: "Start date", type: "date", required: true },
    { name: "endDate", label: "End date", type: "date", required: false, currentToggleLabel: "Current role" },
    { name: "description", label: "Description", type: "textarea", required: true },
  ],
  toFormValues: (item) => ({
    company: item?.company ?? "",
    title: item?.title ?? "",
    location: item?.location ?? "",
    startDate: toDateInputValue(item?.startDate),
    endDate: toDateInputValue(item?.endDate),
    description: item?.description ?? "",
  }),
  toRequestBody: (values) => ({
    company: values.company.trim(),
    title: values.title.trim(),
    location: values.location.trim(),
    startDate: fromDateInputValue(values.startDate),
    endDate: fromDateInputValue(values.endDate),
    description: values.description.trim(),
  }),
};

const educations = {
  key: "educations",
  path: "/api/educations",
  label: "Education",
  labelPlural: "Education",
  supportsCreate: true,
  supportsUpdate: true,
  supportsDelete: true,
  columns: [
    { key: "institution", label: "Institution" },
    { key: "degree", label: "Degree" },
    { key: "fieldOfStudy", label: "Field of study" },
    { key: "startDate", label: "Start", render: (item) => formatDate(item.startDate) },
    { key: "endDate", label: "End", render: (item) => (item.endDate ? formatDate(item.endDate) : "Ongoing") },
  ],
  fields: [
    { name: "institution", label: "Institution", type: "text", required: true, maxLength: 200 },
    { name: "degree", label: "Degree", type: "text", required: true, maxLength: 200 },
    { name: "fieldOfStudy", label: "Field of study", type: "text", required: true, maxLength: 200 },
    { name: "startDate", label: "Start date", type: "date", required: true },
    { name: "endDate", label: "End date", type: "date", required: false, currentToggleLabel: "Ongoing" },
    { name: "description", label: "Description", type: "textarea", required: true },
  ],
  toFormValues: (item) => ({
    institution: item?.institution ?? "",
    degree: item?.degree ?? "",
    fieldOfStudy: item?.fieldOfStudy ?? "",
    startDate: toDateInputValue(item?.startDate),
    endDate: toDateInputValue(item?.endDate),
    description: item?.description ?? "",
  }),
  toRequestBody: (values) => ({
    institution: values.institution.trim(),
    degree: values.degree.trim(),
    fieldOfStudy: values.fieldOfStudy.trim(),
    startDate: fromDateInputValue(values.startDate),
    endDate: fromDateInputValue(values.endDate),
    description: values.description.trim(),
  }),
};

const contacts = {
  key: "contacts",
  path: "/api/contacts",
  label: "Contact",
  labelPlural: "Contacts",
  supportsCreate: true,
  supportsUpdate: false,
  supportsDelete: true,
  columns: [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "company", label: "Company" },
    { key: "createdAt", label: "Received", render: (item) => formatDateTime(item.createdAt) },
  ],
  fields: [
    { name: "name", label: "Name", type: "text", required: true, maxLength: 200 },
    { name: "email", label: "Email", type: "email", required: true, maxLength: 200 },
    { name: "company", label: "Company", type: "text", required: true, maxLength: 200 },
    { name: "message", label: "Message", type: "textarea", required: true },
  ],
  toFormValues: (item) => ({
    name: item?.name ?? "",
    email: item?.email ?? "",
    company: item?.company ?? "",
    message: item?.message ?? "",
  }),
  toRequestBody: (values) => ({
    name: values.name.trim(),
    email: values.email.trim(),
    company: values.company.trim(),
    message: values.message.trim(),
  }),
};

export const resources = [skills, portfolioProjects, workExperiences, educations, contacts];

export const resourcesByKey = Object.fromEntries(resources.map((r) => [r.key, r]));
