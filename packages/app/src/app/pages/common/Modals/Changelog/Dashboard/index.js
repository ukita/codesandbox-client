import React from 'react';
import { inject } from 'mobx-react';
import { Link } from 'react-router-dom';
import theme from '@codesandbox/common/lib/theme';

import { Button } from '@codesandbox/common/lib/components/Button';

// Inline styles because styled-components didn't load the styles
const titleStyles = {
  fontWeight: 600,
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: '1.125rem',
  marginTop: 0,
  marginBottom: 0,
  width: '100%',
  textTransform: 'uppercase',
};

const dateStyles = {
  color: 'rgba(255, 255, 255, 0.5)',
  fontSize: '.875rem',
  float: 'right',
  width: '100%',
  textAlign: 'right',
};

const subTitleStyles = {
  fontWeight: 600,
  color: 'rgba(255, 255, 255, .9)',
  fontSize: '1rem',
  marginTop: '1rem',
  marginBottom: 0,
};

const descriptionStyles = {
  lineHeight: 1.6,
  color: 'rgba(255, 255, 255, 0.7)',
  fontWeight: 600,
  fontSize: '.875rem',
  marginTop: '.5rem',
  marginBottom: 0,
};

const W = props => <span {...props} style={{ color: 'white' }} />;

function DashboardChangelog({ signals }) {
  return (
    <div
      style={{
        padding: '1.5rem',
        backgroundColor: theme.background(),
      }}
    >
      <div
        style={{
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <h1 style={titleStyles}>
          What
          {"'"}s New
        </h1>
        <div style={dateStyles}>July 2nd, 2018</div>
      </div>

      <img
        alt="CodeSandbox Announcement"
        style={{
          width: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: 2,
        }}
        src="https://cdn-images-1.medium.com/max/1600/1*wIMw31_Phf1WNEP6zjuTUw.png"
      />

      <p style={descriptionStyles}>
        We
        {"'"}
        re back with a new update! This update is very focused on{' '}
        <W>collaboration</W> and <W>organization</W>. Let
        {"'"}s take a look!
      </p>

      <h2 style={subTitleStyles}>Dashboard</h2>
      <p style={descriptionStyles}>
        You can now manage your sandboxes in your own{' '}
        <Link to="/dashboard">dashboard</Link>! You
        {"'"}
        re able to <W>filter, sort, search, delete, create and update</W>{' '}
        multiple sandboxes at the same time. The possibilities are endless!
      </p>

      <h2 style={subTitleStyles}>Create Teams</h2>
      <p style={descriptionStyles}>
        An extension to the dashboard is <W>teams</W>! You can now create a team
        with unlimited members to share sandboxes for collaboration. All
        sandboxes automatically sync using <W>live collaboration</W> between
        team members.
      </p>

      <h2 style={subTitleStyles}>Free CodeSandbox Live</h2>
      <p style={descriptionStyles}>
        Teams is not our only feature that allows for collaboration. We also
        have <W>real time collaboration</W> with{' '}
        <Link target="_blank" to="/docs/live">
          CodeSandbox Live
        </Link>
        . Until now this was behind a{' '}
        <Link target="_blank" to="/patron">
          Patron
        </Link>{' '}
        subscription, but we
        {"'"}
        re happy to announce that{' '}
        <W>CodeSandbox Live is from now on free for everyone</W>!
      </p>

      <h2 style={subTitleStyles}>And More</h2>
      <p style={descriptionStyles}>
        There
        {"'"}s a lot more included in this update! Make sure to check out the
        announcement post to find out more about this update.
      </p>

      <div style={{ display: 'flex' }}>
        <Button
          style={{ marginTop: '1rem', marginRight: '.25rem' }}
          block
          small
          secondary
          onClick={() => {
            signals.modalClosed();
          }}
        >
          Close
        </Button>
        <Button
          href="/post/announcing-codesandbox-dashboard-teams"
          style={{ marginTop: '1rem', marginLeft: '.25rem' }}
          block
          small
          target="_blank"
          rel="noreferrer noopener"
        >
          View Announcement
        </Button>
      </div>
    </div>
  );
}

export default inject('signals')(DashboardChangelog);
