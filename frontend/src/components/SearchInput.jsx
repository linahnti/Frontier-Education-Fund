import React from "react";
import { InputGroup, Form, Button } from "react-bootstrap";

const SearchInput = ({ placeholder, value, onChange, onSearch }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch();
  };

  return (
    <Form onSubmit={handleSubmit}>
      <InputGroup>
        <Form.Control
          type="text"
          placeholder={placeholder || "Search..."}
          value={value}
          onChange={onChange}
          className="bg-white text-dark border-secondary"
        />
        <Button variant="primary" type="submit">
          <i className="bi bi-search"></i>
        </Button>
      </InputGroup>
    </Form>
  );
};

export default SearchInput;