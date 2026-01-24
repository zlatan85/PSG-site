import { NextResponse } from 'next/server';
import { defaultHomeSettings, readHomeSettings, writeHomeSettings } from '../../../lib/home-settings-store';

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

export const dynamic = 'force-dynamic';

export async function GET() {
  const settings = await readHomeSettings();
  return NextResponse.json(settings ?? defaultHomeSettings);
}

export async function PUT(request: Request) {
  const payload = await request.json();
  const base = { ...defaultHomeSettings };

  const nextSettings = {
    heroLabel: isNonEmptyString(payload?.heroLabel) ? payload.heroLabel.trim() : base.heroLabel,
    heroTitle: isNonEmptyString(payload?.heroTitle) ? payload.heroTitle.trim() : base.heroTitle,
    heroExcerpt: isNonEmptyString(payload?.heroExcerpt) ? payload.heroExcerpt.trim() : base.heroExcerpt,
    heroImage: isNonEmptyString(payload?.heroImage) ? payload.heroImage.trim() : base.heroImage,
    heroPrimaryLabel: isNonEmptyString(payload?.heroPrimaryLabel) ? payload.heroPrimaryLabel.trim() : base.heroPrimaryLabel,
    heroPrimaryHref: isNonEmptyString(payload?.heroPrimaryHref) ? payload.heroPrimaryHref.trim() : base.heroPrimaryHref,
    heroSecondaryLabel: isNonEmptyString(payload?.heroSecondaryLabel) ? payload.heroSecondaryLabel.trim() : base.heroSecondaryLabel,
    heroSecondaryHref: isNonEmptyString(payload?.heroSecondaryHref) ? payload.heroSecondaryHref.trim() : base.heroSecondaryHref,
    matchdayTitle: isNonEmptyString(payload?.matchdayTitle) ? payload.matchdayTitle.trim() : base.matchdayTitle,
    matchdaySubtitle: isNonEmptyString(payload?.matchdaySubtitle) ? payload.matchdaySubtitle.trim() : base.matchdaySubtitle,
    matchdayStatusLabel: isNonEmptyString(payload?.matchdayStatusLabel)
      ? payload.matchdayStatusLabel.trim()
      : base.matchdayStatusLabel,
    matchdayCompetition: isNonEmptyString(payload?.matchdayCompetition)
      ? payload.matchdayCompetition.trim()
      : base.matchdayCompetition,
    matchdayHomeTeam: isNonEmptyString(payload?.matchdayHomeTeam)
      ? payload.matchdayHomeTeam.trim()
      : base.matchdayHomeTeam,
    matchdayAwayTeam: isNonEmptyString(payload?.matchdayAwayTeam)
      ? payload.matchdayAwayTeam.trim()
      : base.matchdayAwayTeam,
    matchdayScore: isNonEmptyString(payload?.matchdayScore)
      ? payload.matchdayScore.trim()
      : base.matchdayScore,
    matchdayDate: isNonEmptyString(payload?.matchdayDate)
      ? payload.matchdayDate.trim()
      : base.matchdayDate,
    matchdayTime: isNonEmptyString(payload?.matchdayTime)
      ? payload.matchdayTime.trim()
      : base.matchdayTime,
    matchdayStadium: isNonEmptyString(payload?.matchdayStadium)
      ? payload.matchdayStadium.trim()
      : base.matchdayStadium,
    fanZoneTitle: isNonEmptyString(payload?.fanZoneTitle) ? payload.fanZoneTitle.trim() : base.fanZoneTitle,
    fanZoneSubtitle: isNonEmptyString(payload?.fanZoneSubtitle) ? payload.fanZoneSubtitle.trim() : base.fanZoneSubtitle,
    alertsTitle: isNonEmptyString(payload?.alertsTitle) ? payload.alertsTitle.trim() : base.alertsTitle,
    alertsSubtitle: isNonEmptyString(payload?.alertsSubtitle) ? payload.alertsSubtitle.trim() : base.alertsSubtitle,
    supporterHubTitle: isNonEmptyString(payload?.supporterHubTitle) ? payload.supporterHubTitle.trim() : base.supporterHubTitle,
    supporterHubSubtitle: isNonEmptyString(payload?.supporterHubSubtitle) ? payload.supporterHubSubtitle.trim() : base.supporterHubSubtitle,
    spotlightLabel: isNonEmptyString(payload?.spotlightLabel) ? payload.spotlightLabel.trim() : base.spotlightLabel,
    spotlightName: isNonEmptyString(payload?.spotlightName) ? payload.spotlightName.trim() : base.spotlightName,
    spotlightText: isNonEmptyString(payload?.spotlightText) ? payload.spotlightText.trim() : base.spotlightText,
    spotlightImage: isNonEmptyString(payload?.spotlightImage) ? payload.spotlightImage.trim() : base.spotlightImage,
    spotlightFirstName: isNonEmptyString(payload?.spotlightFirstName)
      ? payload.spotlightFirstName.trim()
      : base.spotlightFirstName,
    spotlightLastName: isNonEmptyString(payload?.spotlightLastName)
      ? payload.spotlightLastName.trim()
      : base.spotlightLastName,
    spotlightAge: isNonEmptyString(payload?.spotlightAge) ? payload.spotlightAge.trim() : base.spotlightAge,
    spotlightPosition: isNonEmptyString(payload?.spotlightPosition)
      ? payload.spotlightPosition.trim()
      : base.spotlightPosition,
    spotlightNationality: isNonEmptyString(payload?.spotlightNationality)
      ? payload.spotlightNationality.trim()
      : base.spotlightNationality,
    spotlightGoals: isNonEmptyString(payload?.spotlightGoals) ? payload.spotlightGoals.trim() : base.spotlightGoals,
    spotlightAssists: isNonEmptyString(payload?.spotlightAssists)
      ? payload.spotlightAssists.trim()
      : base.spotlightAssists,
  };

  await writeHomeSettings(nextSettings);
  return NextResponse.json(nextSettings);
}
