export async function validateField(schema, field, values) {
  try {
    await schema.validateAt(field, values);
    return "";
  } catch (error) {
    return error.message;
  }
}

export async function validateAll(schema, values) {
  try {
    await schema.validate(values, { abortEarly: false });
    return {};
  } catch (error) {
    const errors = {};
    for (const issue of error.inner) {
      if (!errors[issue.path]) errors[issue.path] = issue.message;
    }
    return errors;
  }
}
