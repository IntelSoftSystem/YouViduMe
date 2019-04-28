import styled from 'styled-components';

export default styled.button`
    font-family: "roboto", Helvetica, Arial, sans-serif;
    padding: 6px 36px;
    text-align: center;
    margin: 25px auto;
    background: #46b7ff;
    color: #ffffff;
    font-size: 1.2rem;
    border-radius: 3px;
    /* line-height: 78px; */
    font-size: 1.2rem;
    border-radius: 5px;
    border: 0;
    cursor: pointer;
    box-shadow: 0px 3px 6px #E6E6E6;

    :focus {
        outline: 0;
        
    }

    :hover {
        box-shadow: none;
    }
`;
