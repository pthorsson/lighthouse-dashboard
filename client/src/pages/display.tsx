import React, { useState, useRef, useEffect } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import throttle from 'lodash/throttle';
import { defaultTheme } from '../theme.js';
import PageGroup from '../components/page-group/index.js';
import { useLighthouse } from '../hooks/index.js';
import { getUrlQuery } from '../lib/utils.js';

const Display = () => {
  const { data } = useLighthouse();
  const { compared } = getUrlQuery();

  return data ? (
    <ThemeProvider
      theme={{ defaultTheme, itemLayout: compared ? 'compared' : 'standard' }}
    >
      <Wrapper>
        <Header1>Lighthouse scores</Header1>
        <Header2>{data.name}</Header2>
        <AutoScrollArea>
          {data.pageGroups.map((pageGroup) => (
            <PageGroup
              key={pageGroup._id}
              mode="display"
              pageGroup={pageGroup}
            />
          ))}
        </AutoScrollArea>
      </Wrapper>
    </ThemeProvider>
  ) : null;
};

export default Display;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 3vh 50px 0 50px;
  height: 100%;
`;

const Header1 = styled.h1`
  text-align: center;
  font-weight: 300;
  font-size: 40px;
  margin: 0 0 10px 0;
`;

const Header2 = styled.h2`
  text-align: center;
  font-weight: 400;
  margin: 0 0 4vh 0;
`;

const AutoScrollArea: React.FC = ({ children }) => {
  const [scrollEnabled, setScrollEnabled] = useState(false);
  const container = useRef<HTMLInputElement>();
  const firstSection = useRef<HTMLInputElement>();
  const divider = useRef<HTMLInputElement>();
  const { speed } = getUrlQuery();

  const speedModifier = /^[0-9]{1,}(\.[0-9]{1,}|)$/.test(speed)
    ? parseFloat(speed)
    : 1;

  const scrollSpeed = 50 / speedModifier;

  useEffect(() => {
    if (container.current && firstSection.current) {
      const checkSectionHeight = throttle(() => {
        const containerHeight = container.current.offsetHeight;
        const sectionHeight = firstSection.current.offsetHeight;

        setScrollEnabled(sectionHeight > containerHeight);
      }, 100);

      checkSectionHeight();

      window.addEventListener('resize', checkSectionHeight);

      return () => {
        window.removeEventListener('resize', checkSectionHeight);
      };
    }
  }, [container]);

  useEffect(() => {
    if (scrollEnabled) {
      const sectionHeight = firstSection.current.offsetHeight;
      const dividerHeight = divider.current.offsetHeight;
      const resetHeight = sectionHeight + dividerHeight;

      const scrollContent = (timestamp: any) => {
        container.current.scrollTop = (timestamp / scrollSpeed) % resetHeight;
        window.requestAnimationFrame(scrollContent);
      };

      window.requestAnimationFrame(scrollContent);
    }
  }, [scrollEnabled]);

  return (
    <AutoScrollAreaWrapper ref={container}>
      <div ref={firstSection}>{children}</div>
      {scrollEnabled && (
        <>
          <Divider ref={divider}>
            <DividerDot />
            <DividerDot />
            <DividerDot />
          </Divider>
          <div>{children}</div>
        </>
      )}
    </AutoScrollAreaWrapper>
  );
};

const AutoScrollAreaWrapper = styled.div`
  overflow: hidden;
  flex: 1 1 auto;
`;

const Divider = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`;

const DividerDot = styled.div`
  height: 8px;
  width: 8px;
  border-radius: 100%;
  margin: 0 8px;
  background: ${({ theme }) => theme.fg};
`;
