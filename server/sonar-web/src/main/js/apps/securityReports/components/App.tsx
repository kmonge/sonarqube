/*
 * SonarQube
 * Copyright (C) 2009-2018 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
import * as React from 'react';
import * as PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import VulnerabilityList from './VulnerabilityList';
import Suggestions from '../../../app/components/embed-docs-modal/Suggestions';
import { translate } from '../../../helpers/l10n';
import { Component, BranchLike, SecurityHotspot, RuleType } from '../../../app/types';
import DeferredSpinner from '../../../components/common/DeferredSpinner';
import Checkbox from '../../../components/controls/Checkbox';
import { RawQuery } from '../../../helpers/query';
import NotFound from '../../../app/components/NotFound';
import { getSecurityHotspots } from '../../../api/security-reports';
import { isLongLivingBranch } from '../../../helpers/branches';
import DocTooltip from '../../../components/docs/DocTooltip';
import { getRulesUrl } from '../../../helpers/urls';
import { isSonarCloud } from '../../../helpers/system';
import '../style.css';

interface Props {
  branchLike?: BranchLike;
  component: Component;
  location: { pathname: string; query: RawQuery };
  params: { type: string };
}

interface State {
  loading: boolean;
  findings: Array<SecurityHotspot>;
  hasVulnerabilities: boolean;
  type: 'owaspTop10' | 'sansTop25' | 'cwe';
  showCWE: boolean;
}

export default class App extends React.PureComponent<Props, State> {
  mounted = false;

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      findings: [],
      hasVulnerabilities: false,
      type: props.params.type === 'owasp_top_10' ? 'owaspTop10' : 'sansTop25',
      showCWE: props.location.query.showCWE === 'true'
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.fetchSecurityHotspots();
  }

  componentWillReceiveProps(newProps: Props) {
    if (newProps.location.pathname !== this.props.location.pathname) {
      const showCWE = newProps.location.query.showCWE === 'true';
      const type = newProps.params.type === 'owasp_top_10' ? 'owaspTop10' : 'sansTop25';
      this.setState({ type, showCWE }, this.fetchSecurityHotspots);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  fetchSecurityHotspots = () => {
    const { branchLike, component } = this.props;
    this.setState({ loading: true });
    getSecurityHotspots({
      project: component.key,
      standard: this.state.type,
      includeDistribution: this.state.showCWE,
      branch: isLongLivingBranch(branchLike) ? branchLike.name : undefined
    })
      .then(results => {
        if (this.mounted) {
          const hasVulnerabilities = results.categories.some(
            item =>
              item.vulnerabilities +
                item.openSecurityHotspots +
                item.toReviewSecurityHotspots +
                item.wontFixSecurityHotspots >
              0
          );
          this.setState({ hasVulnerabilities, findings: results.categories, loading: false });
        }
      })
      .catch(() => {
        if (this.mounted) {
          this.setState({ loading: false });
        }
      });
  };

  handleCheck = (checked: boolean) => {
    const { router } = this.context;
    router.push({
      pathname: this.props.location.pathname,
      query: { id: this.props.component.key, showCWE: checked }
    });
    this.setState({ showCWE: checked }, this.fetchSecurityHotspots);
  };

  render() {
    const { branchLike, component, params } = this.props;
    const { loading, findings, showCWE, type } = this.state;
    if (params.type !== 'owasp_top_10' && params.type !== 'sans_top_25') {
      return <NotFound withContainer={false} />;
    }
    return (
      <div className="page page-limited" id="security-reports">
        <Suggestions suggestions="security_reports" />
        <Helmet title={translate('security_reports', type, 'page')} />
        <header className="page-header">
          <h1 className="page-title">{translate('security_reports', type, 'page')}</h1>
          <div className="page-description">
            {translate('security_reports', type, 'description')}
            <Link
              className="spacer-left"
              target="_blank"
              to={{ pathname: '/documentation/user-guide/security-reports/' }}>
              {translate('learn_more')}
            </Link>
            <p className="alert alert-info spacer-top display-inline-block">
              <FormattedMessage
                defaultMessage={translate('security_reports.info')}
                id="security_reports.info"
                tagName="p"
                values={{
                  link: (
                    <Link
                      to={getRulesUrl(
                        { types: [RuleType.Vulnerability, RuleType.Hotspot].join() },
                        isSonarCloud() ? component.organization : undefined
                      )}>
                      {translate('security_reports.info.link')}
                    </Link>
                  )
                }}
              />
            </p>
          </div>
        </header>
        <div className="display-inline-flex-center">
          <Checkbox
            checked={showCWE}
            className="spacer-left spacer-right vertical-middle"
            disabled={!this.state.hasVulnerabilities}
            id={'showCWE'}
            onCheck={this.handleCheck}>
            <label className="little-spacer-left" htmlFor={'showCWE'}>
              {translate('security_reports.cwe.show')}
              <DocTooltip
                className="spacer-left"
                doc={import(/* webpackMode: "eager" */ 'Docs/tooltips/security-reports/cwe.md')}
              />
            </label>
          </Checkbox>
        </div>
        <DeferredSpinner loading={loading}>
          <VulnerabilityList
            branchLike={branchLike}
            component={component}
            findings={findings}
            showCWE={showCWE}
            type={type}
          />
        </DeferredSpinner>
      </div>
    );
  }
}
