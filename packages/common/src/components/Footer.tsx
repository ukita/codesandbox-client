import React from 'react';
import styled from 'styled-components';
import MaxWidth from './flex/MaxWidth';

import media from '../utils/media';

const Container = styled.div`
  display: flex;
  justify-content: space-around;
  width: 100%;
  padding-top: 5rem;
  padding-bottom: 3rem;
  flex-wrap: wrap;
`;

const Column = styled.div`
  width: calc(33% - 2rem);
  margin: 0 1rem;

  ${media.phone`
    width: 100%;
    margin-bottom: 1rem;
  `};
`;

const Title = styled.h5`
  font-size: 1.125rem;
  font-weight: 400;
  margin: 0;
  margin-bottom: 1rem;

  color: ${({ theme }) => theme.secondary};
`;

const List = styled.ul`
  color: rgba(255, 255, 255, 0.7);
  list-style-type: none;
  margin: 0;
  padding: 0;

  li {
    a {
      transition: 0.3s ease color;
      text-decoration: none;
      color: rgba(255, 255, 255, 0.7);

      &:hover {
        color: rgba(255, 255, 255, 0.9);
      }
    }
  }
`;

const Background = styled.div`
  position: relative;
  background-color: ${props => props.theme.background2.darken(0.2)};
  padding: 1rem;
  z-index: 5;
`;

export default () => (
  <Background id="footer">
    <MaxWidth width={1280}>
      <React.Fragment>
        <Container>
          <Column>
            <Title>CodeSandbox</Title>
            <List>
              <li>
                <a href="/s" target="_blank" rel="noopener noreferrer">
                  Create Sandbox
                </a>
              </li>
              <li>
                <a href="/search" target="_blank" rel="noopener noreferrer">
                  Search
                </a>
              </li>
              <li>
                <a href="/docs">Documentation</a>
              </li>
              <li>
                <a href="/patron" target="_blank" rel="noopener noreferrer">
                  Patron
                </a>
              </li>
            </List>
          </Column>

          <Column>
            <Title>About</Title>
            <List>
              <li>
                <a href="/blog" target="_blank" rel="noopener noreferrer">
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/codesandbox/codesandbox-client"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a href="/legal">Legal</a>
              </li>
              <li>
                <a href="mailto:hello@codesandbox.io">Contact Us</a>
              </li>
            </List>
          </Column>

          <Column>
            <Title>Social</Title>
            <List>
              <li>
                <a
                  href="https://twitter.com/codesandbox"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href="https://spectrum.chat/codesandbox"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Spectrum
                </a>
              </li>
            </List>
          </Column>
        </Container>
      </React.Fragment>
    </MaxWidth>
  </Background>
);
