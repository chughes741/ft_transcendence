import React from "react";
import styled from "styled-components";

const StyledUser = styled.div`
  display: inline-block;
  padding: 8px 12px;
  margin-bottom: 8px;
  border-radius: 4px;
  background-color: #f1f1f1;
`;

type UserType = {
  uuid: string;
  nick: string;
  email: string;
  avatar: string;
};

const User = (user: UserType) => {
  return (
    <StyledUser>
      <h4>{user.nick}</h4>
      {/* Add more user-related info and functionalities here */}
    </StyledUser>
  );
};

export default User;
