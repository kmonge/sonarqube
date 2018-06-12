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
package org.sonarqube.tests.qualityModel;

import com.sonar.orchestrator.Orchestrator;
import org.junit.ClassRule;
import org.junit.runner.RunWith;
import org.junit.runners.Suite;
import util.ItUtils;

import static util.ItUtils.newOrchestrator;
import static util.ItUtils.xooPlugin;

@RunWith(Suite.class)
@Suite.SuiteClasses({
  MaintainabilityMeasureTest.class,
  MaintainabilityRatingMeasureTest.class,
  NewDebtRatioMeasureTest.class,
  ReliabilityMeasureTest.class,
  SecurityMeasureTest.class,
  TechnicalDebtAndIssueNewMeasuresTest.class,
  TechnicalDebtInIssueChangelogTest.class,
  TechnicalDebtTest.class,
})
public class QualityModelSuite {

  @ClassRule
  public static final Orchestrator ORCHESTRATOR = ItUtils.newOrchestrator(
    builder -> builder
      .addPlugin(xooPlugin())

  );

}
