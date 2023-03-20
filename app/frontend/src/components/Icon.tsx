import styled from "styled-components";

const StyledIcon = styled.div`
  height: 3.5rem;
  width: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4rem;
  color: white;
  cursor: pointer;
  background: ${(props) => props.background};
  svg {
    width: 1.5rem;
    height: 1.5rem;
  }
`;

type IconProps = {
  color: string;
  children: JSX.Element;
  onClick: () => void;
};

export default function Icon({ color, children, onClick }: IconProps): styled {
  return (
    <StyledIcon
      onClick={onClick}
      background={color}
    >
      {children}
    </StyledIcon>
  );
}
