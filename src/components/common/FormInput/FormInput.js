import React, { useCallback } from 'react';
import noop from 'lodash/noop';
import PropTypes from 'prop-types';

const FormInput = ({ name, onChange = noop, component: Component, ...props }) => {
  const handleChange = useCallback(value => onChange(name, value), [name, onChange]);
  return <Component {...props} onChange={handleChange} />;
};

FormInput.protoTypes = {
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  render: PropTypes.func.isRequired,
};

export default FormInput;
