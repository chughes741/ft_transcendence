import styled from "styled-components";

const StyledInput = styled.input`
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  border-radius: 2rem;
  width: 80%;
  height: 3.5rem;
  padding: 1rem;
  border: none;
  outline: none;
  color: #3c354e;
  font-size: 1.2rem;
  font-weight: bold;
  &:focus {
    display: flex;
    box-shadow: 0 0 0 0.2rem #b9abe0;
    backdrop-filter: blur(12rem);
    border-radius: 2rem;
  }
  &::placeholder {
    color: #b9abe099;
    font-weight: 100;
    font-size: 1rem;
  }
`;

class InputCtx {
  value: string;
  type: string;
  placeholder: string;
  onChange: (event) => void;
}

export default function Input(InputCtx: InputCtx): styled {
  return (
    <StyledInput
      required
      type={InputCtx.type}
      placeholder={InputCtx.placeholder}
      value={InputCtx.value}
      onChange={InputCtx.onChange}
    />
  );
}
