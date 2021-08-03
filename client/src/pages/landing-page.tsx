import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { Link, useHistory } from 'react-router-dom';
import { EnsureUserRole, useApi, USER_ROLES } from '@hooks';
import CreateSection from '@components/create-section';
import { useModal } from '@ui/modal';
import { getUrlQuery } from '@lib/utils';
import Navigation from '@components/navigation';

const LandingPage = () => {
  const createSectionModal = useModal('create-section-modal');
  const getSections = useApi<Lhd.Section[]>('/api/sections', {
    runOnMount: true,
  });

  const { token } = getUrlQuery();

  return (
    <Wrapper>
      <NavWrapper>
        <HeaderWrapper>
          <Header1>Lighthouse dashboard</Header1>
          <Header2>Select a section</Header2>
        </HeaderWrapper>
        <Navigation />
      </NavWrapper>
      <InnerWrapper>
        {getSections.data && (
          <>
            <SectionsWrapper
              columns={Math.max(1, Math.min(3, getSections.data.length + 1))}
            >
              {getSections.data.map((section) => (
                <SectionLink
                  key={section._id}
                  to={`/${section.slug}${token ? `?token=${token}` : ''}`}
                >
                  <SectionName>{section.name}</SectionName>
                  <SectionSlug>{section.slug}</SectionSlug>
                </SectionLink>
              ))}
              <EnsureUserRole
                role={USER_ROLES.ADMIN}
                requireLoggedInUser={true}
              >
                <CreateSectionButton
                  onClick={() => createSectionModal.toggle()}
                >
                  Add new section
                </CreateSectionButton>
                <CreateSection onComplete={() => getSections.exec()} />
              </EnsureUserRole>
            </SectionsWrapper>
          </>
        )}
        <RouteMessage />
      </InnerWrapper>
    </Wrapper>
  );
};

export default LandingPage;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 50px 90px;
  height: 100%;
`;

const HeaderWrapper = styled.div``;

const NavWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  flex: 1 1 auto;
`;

const InnerWrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 50px 0;
  height: 100%;
`;

const Header1 = styled.h1`
  font-weight: 300;
  font-size: 40px;
  margin: 0 0 10px 0;
`;

const Header2 = styled.h2`
  font-weight: 400;
  margin: 0 0 50px 0;
`;

type SectionsWrapperProps = {
  columns: number;
};

const SectionsWrapper = styled.div<SectionsWrapperProps>`
  display: grid;
  grid-gap: 15px;
  flex: 0 1 auto;
  grid-template-columns: repeat(${({ columns }) => columns}, 1fr);
  width: ${({ columns }) => columns * 400}px;
  max-width: 100%;
`;

const SectionLink = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  height: 200px;
  padding: 16px;
  text-align: center;
  border-radius: 4px;
  background: ${({ theme }) => theme.bg};

  :after {
    position: absolute;
    display: block;
    content: '';
    top: -5px;
    left: -5px;
    height: calc(100% + 10px);
    width: calc(100% + 10px);
    border-radius: 10px;
    opacity: 0;
    transition: opacity 150ms;
    border: 2px solid ${({ theme }) => theme.fg};
  }

  :hover {
    text-decoration: none;

    :after {
      opacity: 1;
    }
  }
`;

const SectionName = styled.h2`
  display: block;
  font-size: 28px;
  font-weight: 400;
  margin: 0 0 10px 0;
`;

const SectionSlug = styled.p`
  display: block;
  font-weight: 300;
  font-size: 22px;
  opacity: 0.5;
  margin: 0;
`;

const CreateSectionButton = styled.button`
  border: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  height: 200px;
  border-radius: 4px;
  background: transparent;
  border: 2px dashed ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.fg};
  font-size: 22px;
  transition: border 150ms;

  :hover {
    cursor: pointer;
    border-color: ${({ theme }) => theme.fg};
  }
`;

/**
 * Shows a flash message passed with history state
 */

const RouteMessage: React.FC<{ duration?: number }> = ({ duration = 4000 }) => {
  const history = useHistory();
  const message = (history?.location?.state as any)?.message as string;
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && message) {
      setShow(true);
      const timeout = setTimeout(() => {
        setShow(false);
      }, duration);

      return () => clearTimeout(timeout);
    }
  }, [mounted]);

  return message ? (
    <RouteMessageWrapper show={show}>{message}</RouteMessageWrapper>
  ) : null;
};

type RouteMessageWrapperProps = {
  show: boolean;
};

const RouteMessageWrapper = styled.div<RouteMessageWrapperProps>`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  background: black;
  font-size: 22px;
  border-radius: 5px;
  opacity: 0;
  bottom: -100%;
  margin-bottom: 20px;
  transition: bottom 0ms 500ms, opacity 500ms 0ms, margin-bottom 700ms 0ms;

  ${({ show }) =>
    show &&
    css`
      transition: bottom 0ms 0ms, opacity 500ms, margin-bottom 700ms;
      opacity: 1;
      margin-bottom: 40px;
      bottom: 0;
    `}
`;
