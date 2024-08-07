import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

export const ProjectHeader = styled.header`
  width: 100%;
  padding: 20px 30px;
`;

export const ProjectInformation = styled.div`
  display: flex;
  gap: 15px;
  padding: 10px;
`;

export const ProjectContent = styled.div`
  flex: 1;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

export const ProjectInformationCapsule = styled.div`
  display: flex;
  align-items: center;
  margin: 0;
  background: #f4f4f4;
  padding: 5px 10px;
  border-radius: 10px;
`;

export const HeaderButtonContainer = styled.div`
  display: flex;
  gap: 10px;
`;

export const HeaderButton = styled.button`
  font-size: 14px;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background: #181c24;
  color: white;
  cursor: pointer;
`;
