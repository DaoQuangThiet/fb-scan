import React from 'react';
import TextField from '@mui/material/TextField';

const Input = ({
  disabled,
  type,
  name,
  value,
  onChange,
  errors,
  required,
  title,
  placeholder,
}) => {
  return (
    <div className="p-3">
      <TextField
        required={required}
        fullWidth
        label={title}
        id={name}
        type={type}
        disabled={disabled}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
};

export default Input;
