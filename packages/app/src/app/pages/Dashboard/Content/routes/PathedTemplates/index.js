import React, { useEffect } from 'react';
import { useQuery } from '@apollo/react-hooks';
import { uniq } from 'lodash-es';
import { observer } from 'mobx-react-lite';
import Loading from 'app/components/Loading';
import { useStore } from 'app/store';

import Sandboxes from '../../Sandboxes';
import { Navigation } from './Navigation';
import { LIST_TEMPLATES } from '../../../queries';

const PathedTemplates = props => {
  const { dashboard } = useStore();
  const path = `/${props.match.params.path || ''}`;
  const { loading, error, data } = useQuery(LIST_TEMPLATES);

  useEffect(() => {
    document.title = `Templates - CodeSandbox`;
  }, []);

  if (error) {
    console.error(error);
    return <div>Error!</div>;
  }

  if (loading) {
    return <Loading />;
  }

  const possibleTemplates = data.me.templates.length
    ? uniq(data.me.templates.map(x => x.sandbox.source.template))
    : [];

  const sandboxes = data.me.templates.map(t => ({
    ...t.sandbox,
    title: t.title,
    description: t.description,
    color: t.color,
  }));

  return (
    <Sandboxes
      isLoading={loading}
      possibleTemplates={possibleTemplates}
      Header={<Navigation path={path} />}
      sandboxes={dashboard.getFilteredSandboxes(sandboxes)}
    />
  );
};

export default observer(PathedTemplates);
