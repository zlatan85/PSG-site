'use client';

import type { ChangeEvent, FormEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FadeIn, ScaleIn } from '../../components/MotionWrapper';

interface NewsArticle {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  content?: string;
}

interface MatchEntry {
  id: number;
  date: string;
  time: string;
  home: string;
  away: string;
  competition: string;
  stadium: string;
  status: 'upcoming' | 'played';
  score?: string;
  result?: 'W' | 'D' | 'L';
}

interface PlayerEntry {
  id: number;
  name: string;
  position: string;
  group: 'goalkeeper' | 'defender' | 'midfielder' | 'forward';
  number: number;
  nationality: string;
  age: number;
  image: string;
}

interface StaffEntry {
  id: number;
  name: string;
  role: string;
  nationality: string;
  image: string;
}

interface LiveMatchEvent {
  minute: number;
  team: string;
  type: 'goal' | 'card' | 'substitution' | 'chance';
  player: string;
  detail: string;
}

interface FanWallPost {
  id: number;
  name: string;
  handle: string;
  message: string;
  time: string;
  approved: boolean;
}

interface StandingRow {
  pos: number;
  club: string;
  pts: number;
  j: number;
  g: number;
  n: number;
  p: number;
  diff: string;
}

interface StandingsPayload {
  ligue1: StandingRow[];
  championsLeague: StandingRow[];
}

interface TopScorerRow {
  pos: number;
  player: string;
  club: string;
  goals: number;
}

interface TopAssistRow {
  pos: number;
  player: string;
  club: string;
  assists: number;
}

interface TopStatsPayload {
  scorers: TopScorerRow[];
  assists: TopAssistRow[];
}
interface HomeSettings {
  heroLabel: string;
  heroTitle: string;
  heroExcerpt: string;
  heroImage: string;
  heroPrimaryLabel: string;
  heroPrimaryHref: string;
  heroSecondaryLabel: string;
  heroSecondaryHref: string;
  matchdayTitle: string;
  matchdaySubtitle: string;
  matchdayStatusLabel: string;
  matchdayCompetition: string;
  matchdayHomeTeam: string;
  matchdayAwayTeam: string;
  matchdayScore: string;
  matchdayDate: string;
  matchdayTime: string;
  matchdayStadium: string;
  fanZoneTitle: string;
  fanZoneSubtitle: string;
  alertsTitle: string;
  alertsSubtitle: string;
  supporterHubTitle: string;
  supporterHubSubtitle: string;
  spotlightLabel: string;
}

interface FooterSettings {
  brandTitle: string;
  brandText: string;
  alertsTitle: string;
  alertsText: string;
  alertsCtaLabel: string;
  bottomText: string;
}

const emptyForm = {
  title: '',
  excerpt: '',
  image: '',
  date: '',
  content: '',
};

const emptyMatchForm = {
  date: '',
  time: '',
  home: '',
  away: '',
  competition: '',
  stadium: '',
  status: 'upcoming' as MatchEntry['status'],
  score: '',
  result: '' as '' | 'W' | 'D' | 'L',
};

const emptyPlayerForm = {
  name: '',
  position: '',
  group: 'goalkeeper' as PlayerEntry['group'],
  number: '',
  nationality: '',
  age: '',
  image: '',
};

const emptyStaffForm = {
  name: '',
  role: '',
  nationality: '',
  image: '',
};

const emptyLiveEventForm: LiveMatchEvent = {
  minute: 0,
  team: '',
  type: 'goal',
  player: '',
  detail: '',
};

const emptyFanWallForm: FanWallPost = {
  id: 0,
  name: '',
  handle: '',
  message: '',
  time: '',
  approved: true,
};

const defaultHomeSettings: HomeSettings = {
  heroLabel: 'La une du jour',
  heroTitle: 'ULTEAM PSG-X',
  heroExcerpt: 'Toutes les actus, les moments forts et les insights pour vivre Paris a fond.',
  heroImage: '/api/placeholder/1600/900',
  heroPrimaryLabel: "Lire l'article",
  heroPrimaryHref: '/news',
  heroSecondaryLabel: 'Toutes les actus',
  heroSecondaryHref: '/news',
  matchdayTitle: 'Matchday Spotlight',
  matchdaySubtitle: 'Suis le live, la fan zone et les moments forts du match.',
  matchdayStatusLabel: '',
  matchdayCompetition: '',
  matchdayHomeTeam: '',
  matchdayAwayTeam: '',
  matchdayScore: '',
  matchdayDate: '',
  matchdayTime: '',
  matchdayStadium: '',
  fanZoneTitle: 'Le coeur du supporter',
  fanZoneSubtitle: 'Mur des supporters, pronostics, highlights et challenges.',
  alertsTitle: 'Alertes Matchday',
  alertsSubtitle: 'Recois les moments forts, la compo officielle et les buts en temps reel.',
  supporterHubTitle: 'Supporter Hub',
  supporterHubSubtitle: "Tout ce qu'il faut pour vivre PSG a fond.",
  spotlightLabel: 'Player Spotlight',
};

const defaultFooterSettings: FooterSettings = {
  brandTitle: 'ULTEAM PSG-X',
  brandText: 'Le hub des supporters: actus, live, fan zone et moments forts du PSG.',
  alertsTitle: 'Matchday Alertes',
  alertsText: 'Recois les moments chauds du match et les annonces officielles.',
  alertsCtaLabel: "M'alerter",
  bottomText: '© 2026 ULTEAM PSG-X. Tous droits reserves.',
};

const defaultStandings: StandingsPayload = {
  ligue1: [
    { pos: 1, club: 'PSG', pts: 0, j: 0, g: 0, n: 0, p: 0, diff: '+0' },
    { pos: 2, club: 'Monaco', pts: 0, j: 0, g: 0, n: 0, p: 0, diff: '+0' },
    { pos: 3, club: 'Lille', pts: 0, j: 0, g: 0, n: 0, p: 0, diff: '+0' },
    { pos: 4, club: 'Marseille', pts: 0, j: 0, g: 0, n: 0, p: 0, diff: '+0' },
  ],
  championsLeague: [
    { pos: 1, club: 'PSG', pts: 0, j: 0, g: 0, n: 0, p: 0, diff: '+0' },
    { pos: 2, club: 'Dortmund', pts: 0, j: 0, g: 0, n: 0, p: 0, diff: '+0' },
    { pos: 3, club: 'Milan', pts: 0, j: 0, g: 0, n: 0, p: 0, diff: '+0' },
    { pos: 4, club: 'Newcastle', pts: 0, j: 0, g: 0, n: 0, p: 0, diff: '+0' },
  ],
};

const defaultTopStats: TopStatsPayload = {
  scorers: [
    { pos: 1, player: 'K. Mbappe', club: 'PSG', goals: 0 },
    { pos: 2, player: 'O. Dembele', club: 'PSG', goals: 0 },
    { pos: 3, player: 'R. Kolo Muani', club: 'PSG', goals: 0 },
  ],
  assists: [
    { pos: 1, player: 'A. Hakimi', club: 'PSG', assists: 0 },
    { pos: 2, player: 'Vitinha', club: 'PSG', assists: 0 },
    { pos: 3, player: 'K. Mbappe', club: 'PSG', assists: 0 },
  ],
};

export default function AdminPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchEntry[]>([]);
  const [matchForm, setMatchForm] = useState(emptyMatchForm);
  const [editingMatchId, setEditingMatchId] = useState<number | null>(null);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [matchSaving, setMatchSaving] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);
  const [players, setPlayers] = useState<PlayerEntry[]>([]);
  const [staff, setStaff] = useState<StaffEntry[]>([]);
  const [playerForm, setPlayerForm] = useState(emptyPlayerForm);
  const [staffForm, setStaffForm] = useState(emptyStaffForm);
  const [editingPlayerId, setEditingPlayerId] = useState<number | null>(null);
  const [editingStaffId, setEditingStaffId] = useState<number | null>(null);
  const [squadLoading, setSquadLoading] = useState(true);
  const [playerSaving, setPlayerSaving] = useState(false);
  const [staffSaving, setStaffSaving] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [staffError, setStaffError] = useState<string | null>(null);
  const newsContentRef = useRef<HTMLTextAreaElement | null>(null);
  const [liveEvents, setLiveEvents] = useState<LiveMatchEvent[]>([]);
  const [liveEventForm, setLiveEventForm] = useState<LiveMatchEvent>(emptyLiveEventForm);
  const [editingLiveEventIndex, setEditingLiveEventIndex] = useState<number | null>(null);
  const [liveLoading, setLiveLoading] = useState(true);
  const [liveSaving, setLiveSaving] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [fanWallPosts, setFanWallPosts] = useState<FanWallPost[]>([]);
  const [fanWallForm, setFanWallForm] = useState<FanWallPost>(emptyFanWallForm);
  const [editingFanWallId, setEditingFanWallId] = useState<number | null>(null);
  const [fanWallLoading, setFanWallLoading] = useState(true);
  const [fanWallSaving, setFanWallSaving] = useState(false);
  const [fanWallError, setFanWallError] = useState<string | null>(null);
  const [homeSettings, setHomeSettings] = useState<HomeSettings>(defaultHomeSettings);
  const [homeLoading, setHomeLoading] = useState(true);
  const [homeSaving, setHomeSaving] = useState(false);
  const [homeError, setHomeError] = useState<string | null>(null);
  const [footerSettings, setFooterSettings] = useState<FooterSettings>(defaultFooterSettings);
  const [footerLoading, setFooterLoading] = useState(true);
  const [footerSaving, setFooterSaving] = useState(false);
  const [footerError, setFooterError] = useState<string | null>(null);
  const [standings, setStandings] = useState<StandingsPayload>(defaultStandings);
  const [standingsLoading, setStandingsLoading] = useState(true);
  const [standingsSaving, setStandingsSaving] = useState(false);
  const [standingsError, setStandingsError] = useState<string | null>(null);
  const [topStats, setTopStats] = useState<TopStatsPayload>(defaultTopStats);
  const [topStatsLoading, setTopStatsLoading] = useState(true);
  const [topStatsSaving, setTopStatsSaving] = useState(false);
  const [topStatsError, setTopStatsError] = useState<string | null>(null);

  const sortedArticles = useMemo(
    () => [...articles].sort((a, b) => b.date.localeCompare(a.date)),
    [articles]
  );

  const sortedMatches = useMemo(
    () => [...matches].sort((a, b) => b.date.localeCompare(a.date)),
    [matches]
  );

  const sortedPlayers = useMemo(
    () => [...players].sort((a, b) => a.number - b.number),
    [players]
  );

  const sortedStaff = useMemo(
    () => [...staff].sort((a, b) => a.name.localeCompare(b.name)),
    [staff]
  );

  const sortedLiveEvents = useMemo(
    () =>
      liveEvents
        .map((eventItem, index) => ({ eventItem, index }))
        .sort((a, b) => a.eventItem.minute - b.eventItem.minute),
    [liveEvents]
  );

  const sortedFanWall = useMemo(
    () => [...fanWallPosts].sort((a, b) => a.id - b.id),
    [fanWallPosts]
  );

  const loadArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/news');
      const data = await response.json();
      setArticles(Array.isArray(data) ? data : []);
    } catch (loadError) {
      console.error('Failed to load news:', loadError);
      setError('Impossible de charger les articles.');
    } finally {
      setLoading(false);
    }
  };

  const loadMatches = async () => {
    try {
      setMatchesLoading(true);
      const response = await fetch('/api/matches');
      const data = await response.json();
      setMatches(Array.isArray(data) ? data : []);
    } catch (loadError) {
      console.error('Failed to load matches:', loadError);
      setMatchError('Impossible de charger le calendrier.');
    } finally {
      setMatchesLoading(false);
    }
  };

  const loadSquad = async () => {
    try {
      setSquadLoading(true);
      const response = await fetch('/api/squad');
      const data = await response.json();
      setPlayers(Array.isArray(data?.players) ? data.players : []);
      setStaff(Array.isArray(data?.staff) ? data.staff : []);
    } catch (loadError) {
      console.error('Failed to load squad:', loadError);
      setPlayerError('Impossible de charger l\'effectif.');
      setStaffError('Impossible de charger le staff.');
    } finally {
      setSquadLoading(false);
    }
  };

  const loadLiveMatch = async () => {
    try {
      setLiveLoading(true);
      const response = await fetch('/api/live-match');
      if (!response.ok) {
        throw new Error('Request failed');
      }
      const data = await response.json();
      setLiveEvents(Array.isArray(data?.events) ? data.events : []);
    } catch (loadError) {
      console.error('Failed to load live match:', loadError);
      setLiveError('Impossible de charger le live match.');
    } finally {
      setLiveLoading(false);
    }
  };

  const loadFanWall = async () => {
    try {
      setFanWallLoading(true);
      const response = await fetch('/api/fan-wall?all=1');
      const data = await response.json();
      setFanWallPosts(Array.isArray(data) ? data : []);
    } catch (loadError) {
      console.error('Failed to load fan wall:', loadError);
      setFanWallError('Impossible de charger la fan zone.');
    } finally {
      setFanWallLoading(false);
    }
  };

  const loadHomeSettings = async () => {
    try {
      setHomeLoading(true);
      const response = await fetch('/api/home-settings');
      const data = await response.json();
      setHomeSettings({ ...defaultHomeSettings, ...(data || {}) });
    } catch (loadError) {
      console.error('Failed to load home settings:', loadError);
      setHomeError('Impossible de charger la home.');
    } finally {
      setHomeLoading(false);
    }
  };

  const loadFooterSettings = async () => {
    try {
      setFooterLoading(true);
      const response = await fetch('/api/footer-settings');
      const data = await response.json();
      setFooterSettings({ ...defaultFooterSettings, ...(data || {}) });
    } catch (loadError) {
      console.error('Failed to load footer settings:', loadError);
      setFooterError('Impossible de charger le footer.');
    } finally {
      setFooterLoading(false);
    }
  };

  const loadStandings = async () => {
    try {
      setStandingsLoading(true);
      const response = await fetch('/api/standings');
      const data = await response.json();
      if (data?.ligue1 && data?.championsLeague) {
        setStandings(data);
      } else {
        setStandings(defaultStandings);
      }
    } catch (loadError) {
      console.error('Failed to load standings:', loadError);
      setStandingsError('Impossible de charger les classements.');
    } finally {
      setStandingsLoading(false);
    }
  };

  const loadTopStats = async () => {
    try {
      setTopStatsLoading(true);
      const response = await fetch('/api/top-stats');
      const data = await response.json();
      if (data?.scorers && data?.assists) {
        setTopStats(data);
      } else {
        setTopStats(defaultTopStats);
      }
    } catch (loadError) {
      console.error('Failed to load top stats:', loadError);
      setTopStatsError('Impossible de charger les tops.');
    } finally {
      setTopStatsLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
    loadMatches();
    loadSquad();
    loadLiveMatch();
    loadFanWall();
    loadHomeSettings();
    loadFooterSettings();
    loadStandings();
    loadTopStats();
  }, []);

  const handleChange = (field: keyof typeof form) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const insertMarkdown = (before: string, after = '') => {
    const textarea = newsContentRef.current;
    if (!textarea) {
      setForm((current) => ({ ...current, content: `${current.content}${before}${after}` }));
      return;
    }

    const { selectionStart, selectionEnd, value } = textarea;
    const selected = value.slice(selectionStart, selectionEnd);
    const nextValue = `${value.slice(0, selectionStart)}${before}${selected}${after}${value.slice(selectionEnd)}`;
    setForm((current) => ({ ...current, content: nextValue }));

    requestAnimationFrame(() => {
      const cursorStart = selectionStart + before.length;
      const cursorEnd = cursorStart + selected.length;
      textarea.focus();
      textarea.setSelectionRange(cursorStart, cursorEnd);
    });
  };

  const handleMatchChange = (field: keyof typeof matchForm) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setMatchForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handlePlayerChange = (field: keyof typeof playerForm) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setPlayerForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleStaffChange = (field: keyof typeof staffForm) => (event: ChangeEvent<HTMLInputElement>) => {
    setStaffForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleLiveEventChange = (field: keyof LiveMatchEvent) => (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const value = field === 'minute' ? Number(event.target.value) : event.target.value;
    setLiveEventForm((current) => ({ ...current, [field]: value } as LiveMatchEvent));
  };

  const handleFanWallChange = (field: keyof FanWallPost) => (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = field === 'approved' && event.target instanceof HTMLInputElement
      ? event.target.checked
      : event.target.value;
    setFanWallForm((current) => ({ ...current, [field]: value } as FanWallPost));
  };

  const handleHomeSettingsChange = (field: keyof HomeSettings) => (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setHomeSettings((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleFooterSettingsChange = (field: keyof FooterSettings) => (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFooterSettings((current) => ({ ...current, [field]: event.target.value }));
  };

  const updateStandingsRow = (
    table: keyof StandingsPayload,
    index: number,
    field: keyof StandingRow,
    value: string
  ) => {
    setStandings((current) => {
      const nextTable = [...current[table]];
      const row = { ...nextTable[index] };
      if (field === 'club' || field === 'diff') {
        row[field] = value;
      } else {
        row[field] = Number(value);
      }
      nextTable[index] = row;
      return { ...current, [table]: nextTable };
    });
  };

  const addStandingsRow = (table: keyof StandingsPayload) => {
    setStandings((current) => ({
      ...current,
      [table]: [
        ...current[table],
        { pos: current[table].length + 1, club: 'Club', pts: 0, j: 0, g: 0, n: 0, p: 0, diff: '+0' },
      ],
    }));
  };

  const removeStandingsRow = (table: keyof StandingsPayload, index: number) => {
    setStandings((current) => ({
      ...current,
      [table]: current[table].filter((_, rowIndex) => rowIndex !== index),
    }));
  };

  const updateTopStatsRow = (
    table: keyof TopStatsPayload,
    index: number,
    field: keyof (TopScorerRow & TopAssistRow),
    value: string
  ) => {
    setTopStats((current) => {
      const nextTable = [...current[table]];
      const row = { ...nextTable[index] } as TopScorerRow & TopAssistRow;
      if (field === 'player' || field === 'club') {
        row[field] = value;
      } else {
        row[field] = Number(value);
      }
      nextTable[index] = row;
      return { ...current, [table]: nextTable };
    });
  };

  const addTopStatsRow = (table: keyof TopStatsPayload) => {
    setTopStats((current) => ({
      ...current,
      [table]: [
        ...current[table],
        table === 'scorers'
          ? { pos: current[table].length + 1, player: 'Joueur', club: 'Club', goals: 0 }
          : { pos: current[table].length + 1, player: 'Joueur', club: 'Club', assists: 0 },
      ],
    }));
  };

  const removeTopStatsRow = (table: keyof TopStatsPayload, index: number) => {
    setTopStats((current) => ({
      ...current,
      [table]: current[table].filter((_, rowIndex) => rowIndex !== index),
    }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSaving(true);

    try {
    const payload = {
      ...form,
      image: form.image.trim() || '/api/placeholder/600/400',
    };

      const response = await fetch('/api/news', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadArticles();
    } catch (submitError) {
      console.error('Failed to save news:', submitError);
      setError('Impossible de sauvegarder cet article.');
    } finally {
      setSaving(false);
    }
  };

  const handleMatchSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMatchError(null);
    setMatchSaving(true);

    try {
      const payload = {
        ...matchForm,
        score: matchForm.score.trim(),
        result: matchForm.result || undefined,
      };

      const response = await fetch('/api/matches', {
        method: editingMatchId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingMatchId ? { id: editingMatchId, ...payload } : payload),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      setMatchForm(emptyMatchForm);
      setEditingMatchId(null);
      await loadMatches();
    } catch (submitError) {
      console.error('Failed to save match:', submitError);
      setMatchError('Impossible de sauvegarder ce match.');
    } finally {
      setMatchSaving(false);
    }
  };

  const handlePlayerSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setPlayerError(null);
    setPlayerSaving(true);

    try {
      const payload = {
        kind: 'player',
        name: playerForm.name,
        position: playerForm.position,
        group: playerForm.group,
        number: Number(playerForm.number),
        nationality: playerForm.nationality,
        age: Number(playerForm.age),
        image: playerForm.image.trim() || '/api/placeholder/300/400',
      };

      const response = await fetch('/api/squad', {
        method: editingPlayerId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPlayerId ? { id: editingPlayerId, ...payload } : payload),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      setPlayerForm(emptyPlayerForm);
      setEditingPlayerId(null);
      await loadSquad();
    } catch (submitError) {
      console.error('Failed to save player:', submitError);
      setPlayerError('Impossible de sauvegarder ce joueur.');
    } finally {
      setPlayerSaving(false);
    }
  };

  const handleStaffSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStaffError(null);
    setStaffSaving(true);

    try {
      const payload = {
        kind: 'staff',
        name: staffForm.name,
        role: staffForm.role,
        nationality: staffForm.nationality,
        image: staffForm.image.trim() || '/api/placeholder/300/400',
      };

      const response = await fetch('/api/squad', {
        method: editingStaffId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingStaffId ? { id: editingStaffId, ...payload } : payload),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      setStaffForm(emptyStaffForm);
      setEditingStaffId(null);
      await loadSquad();
    } catch (submitError) {
      console.error('Failed to save staff:', submitError);
      setStaffError('Impossible de sauvegarder ce membre du staff.');
    } finally {
      setStaffSaving(false);
    }
  };

  const handleLiveEventSubmit = (event: FormEvent) => {
    event.preventDefault();
    setLiveError(null);

    const trimmedEvent = {
      ...liveEventForm,
      team: liveEventForm.team.trim(),
      player: liveEventForm.player.trim(),
      detail: liveEventForm.detail.trim(),
    };

    if (!trimmedEvent.team || !trimmedEvent.player || !trimmedEvent.detail) {
      setLiveError('Merci de remplir tous les champs de l\'evenement.');
      return;
    }

    setLiveEvents((current) => {
      if (editingLiveEventIndex === null) {
        return [...current, trimmedEvent];
      }
      return current.map((item, index) => (index === editingLiveEventIndex ? trimmedEvent : item));
    });

    setLiveEventForm(emptyLiveEventForm);
    setEditingLiveEventIndex(null);
  };

  const handleFanWallSubmit = (event: FormEvent) => {
    event.preventDefault();
    setFanWallError(null);

    const trimmedPost = {
      ...fanWallForm,
      name: fanWallForm.name.trim(),
      handle: fanWallForm.handle.trim(),
      message: fanWallForm.message.trim(),
      time: fanWallForm.time.trim(),
    };

    if (!trimmedPost.name || !trimmedPost.message) {
      setFanWallError('Merci de remplir au moins le nom et le message.');
      return;
    }

    setFanWallPosts((current) => {
      if (editingFanWallId === null) {
        const nextId = current.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1;
        return [...current, { ...trimmedPost, id: nextId, approved: true }];
      }
      return current.map((item) => (item.id === editingFanWallId ? { ...trimmedPost, id: item.id } : item));
    });

    setFanWallForm(emptyFanWallForm);
    setEditingFanWallId(null);
  };

  const saveHomeSettings = async () => {
    setHomeError(null);
    setHomeSaving(true);

    try {
      const response = await fetch('/api/home-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(homeSettings),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      const data = await response.json();
      setHomeSettings({ ...defaultHomeSettings, ...(data || {}) });
    } catch (saveError) {
      console.error('Failed to save home settings:', saveError);
      setHomeError('Impossible de sauvegarder la home.');
    } finally {
      setHomeSaving(false);
    }
  };

  const saveFooterSettings = async () => {
    setFooterError(null);
    setFooterSaving(true);

    try {
      const response = await fetch('/api/footer-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(footerSettings),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      const data = await response.json();
      setFooterSettings({ ...defaultFooterSettings, ...(data || {}) });
    } catch (saveError) {
      console.error('Failed to save footer settings:', saveError);
      setFooterError('Impossible de sauvegarder le footer.');
    } finally {
      setFooterSaving(false);
    }
  };

  const saveStandings = async () => {
    setStandingsError(null);
    setStandingsSaving(true);

    try {
      const response = await fetch('/api/standings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(standings),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      const data = await response.json();
      if (data?.ligue1 && data?.championsLeague) {
        setStandings(data);
      }
    } catch (saveError) {
      console.error('Failed to save standings:', saveError);
      setStandingsError('Impossible de sauvegarder les classements.');
    } finally {
      setStandingsSaving(false);
    }
  };

  const saveTopStats = async () => {
    setTopStatsError(null);
    setTopStatsSaving(true);

    try {
      const response = await fetch('/api/top-stats', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(topStats),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      const data = await response.json();
      if (data?.scorers && data?.assists) {
        setTopStats(data);
      }
    } catch (saveError) {
      console.error('Failed to save top stats:', saveError);
      setTopStatsError('Impossible de sauvegarder les tops.');
    } finally {
      setTopStatsSaving(false);
    }
  };

  const startEdit = (article: NewsArticle) => {
    setForm({
      title: article.title,
      excerpt: article.excerpt,
      image: article.image,
      date: article.date,
      content: article.content ?? '',
    });
    setEditingId(article.id);
    setError(null);
  };

  const startMatchEdit = (match: MatchEntry) => {
    setMatchForm({
      date: match.date,
      time: match.time,
      home: match.home,
      away: match.away,
      competition: match.competition,
      stadium: match.stadium,
      status: match.status,
      score: match.score ?? '',
      result: match.result ?? '',
    });
    setEditingMatchId(match.id);
    setMatchError(null);
  };

  const startPlayerEdit = (player: PlayerEntry) => {
    setPlayerForm({
      name: player.name,
      position: player.position,
      group: player.group,
      number: String(player.number),
      nationality: player.nationality,
      age: String(player.age),
      image: player.image,
    });
    setEditingPlayerId(player.id);
    setPlayerError(null);
  };

  const startStaffEdit = (member: StaffEntry) => {
    setStaffForm({
      name: member.name,
      role: member.role,
      nationality: member.nationality,
      image: member.image,
    });
    setEditingStaffId(member.id);
    setStaffError(null);
  };

  const startLiveEventEdit = (eventItem: LiveMatchEvent, index: number) => {
    setLiveEventForm(eventItem);
    setEditingLiveEventIndex(index);
    setLiveError(null);
  };

  const startFanWallEdit = (post: FanWallPost) => {
    setFanWallForm(post);
    setEditingFanWallId(post.id);
    setFanWallError(null);
  };

  const cancelEdit = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError(null);
  };

  const cancelMatchEdit = () => {
    setMatchForm(emptyMatchForm);
    setEditingMatchId(null);
    setMatchError(null);
  };

  const cancelPlayerEdit = () => {
    setPlayerForm(emptyPlayerForm);
    setEditingPlayerId(null);
    setPlayerError(null);
  };

  const cancelStaffEdit = () => {
    setStaffForm(emptyStaffForm);
    setEditingStaffId(null);
    setStaffError(null);
  };

  const cancelLiveEventEdit = () => {
    setLiveEventForm(emptyLiveEventForm);
    setEditingLiveEventIndex(null);
    setLiveError(null);
  };

  const cancelFanWallEdit = () => {
    setFanWallForm(emptyFanWallForm);
    setEditingFanWallId(null);
    setFanWallError(null);
  };

  const deleteArticle = async (id: number) => {
    const confirmed = window.confirm('Supprimer cet article ?');
    if (!confirmed) return;

    try {
      setSaving(true);
      const response = await fetch('/api/news', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      await loadArticles();
    } catch (deleteError) {
      console.error('Failed to delete news:', deleteError);
      setError('Impossible de supprimer cet article.');
    } finally {
      setSaving(false);
    }
  };

  const deleteMatch = async (id: number) => {
    const confirmed = window.confirm('Supprimer ce match ?');
    if (!confirmed) return;

    try {
      setMatchSaving(true);
      const response = await fetch('/api/matches', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      await loadMatches();
    } catch (deleteError) {
      console.error('Failed to delete match:', deleteError);
      setMatchError('Impossible de supprimer ce match.');
    } finally {
      setMatchSaving(false);
    }
  };

  const deletePlayer = async (id: number) => {
    const confirmed = window.confirm('Supprimer ce joueur ?');
    if (!confirmed) return;

    try {
      setPlayerSaving(true);
      const response = await fetch('/api/squad', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, kind: 'player' }),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      await loadSquad();
    } catch (deleteError) {
      console.error('Failed to delete player:', deleteError);
      setPlayerError('Impossible de supprimer ce joueur.');
    } finally {
      setPlayerSaving(false);
    }
  };

  const deleteStaff = async (id: number) => {
    const confirmed = window.confirm('Supprimer ce membre du staff ?');
    if (!confirmed) return;

    try {
      setStaffSaving(true);
      const response = await fetch('/api/squad', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, kind: 'staff' }),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      await loadSquad();
    } catch (deleteError) {
      console.error('Failed to delete staff:', deleteError);
      setStaffError('Impossible de supprimer ce membre du staff.');
    } finally {
      setStaffSaving(false);
    }
  };

  const deleteLiveEvent = (index: number) => {
    const confirmed = window.confirm('Supprimer cet evenement ?');
    if (!confirmed) return;
    setLiveEvents((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const saveLiveTimeline = async () => {
    setLiveError(null);
    setLiveSaving(true);

    try {
      const response = await fetch('/api/live-match', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: liveEvents }),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      const data = await response.json();
      setLiveEvents(Array.isArray(data?.events) ? data.events : []);
      setLiveEventForm(emptyLiveEventForm);
      setEditingLiveEventIndex(null);
    } catch (saveError) {
      console.error('Failed to save live events:', saveError);
      setLiveError('Impossible de sauvegarder la timeline.');
    } finally {
      setLiveSaving(false);
    }
  };

  const persistFanWall = async (nextPosts: FanWallPost[]) => {
    setFanWallError(null);
    setFanWallSaving(true);

    try {
      const response = await fetch('/api/fan-wall', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ posts: nextPosts }),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      const data = await response.json();
      setFanWallPosts(Array.isArray(data) ? data : []);
      setFanWallForm(emptyFanWallForm);
      setEditingFanWallId(null);
    } catch (saveError) {
      console.error('Failed to save fan wall:', saveError);
      setFanWallError('Impossible de sauvegarder la fan zone.');
    } finally {
      setFanWallSaving(false);
    }
  };

  const saveFanWall = async () => {
    await persistFanWall(fanWallPosts);
  };

  const deleteFanWallPost = async (id: number) => {
    const confirmed = window.confirm('Supprimer ce message fan wall ?');
    if (!confirmed) return;
    const nextPosts = fanWallPosts.filter((item) => item.id !== id);
    setFanWallPosts(nextPosts);
    if (editingFanWallId === id) {
      setFanWallForm(emptyFanWallForm);
      setEditingFanWallId(null);
    }
    await persistFanWall(nextPosts);
  };

  const toggleFanWallApproval = async (id: number) => {
    const nextPosts = fanWallPosts.map((item) =>
      item.id === id ? { ...item, approved: !item.approved } : item
    );
    setFanWallPosts(nextPosts);
    await persistFanWall(nextPosts);
  };

  const previewImage = form.image.trim() || '/api/placeholder/600/400';
  const previewPlayerImage = playerForm.image.trim() || '/api/placeholder/300/400';
  const previewStaffImage = staffForm.image.trim() || '/api/placeholder/300/400';

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <FadeIn delay={0.2}>
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-white mb-4">Administration</h1>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Ajoutez, modifiez et supprimez les articles et leurs images.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <FadeIn delay={0.3}>
            <form onSubmit={handleSubmit} className="glass rounded-lg p-6 space-y-4">
              <div className="text-lg font-semibold text-white">
                {editingId ? 'Modifier un article' : 'Nouvel article'}
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Titre"
                  value={form.title}
                  onChange={handleChange('title')}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                  required
                />
                <textarea
                  placeholder="Extrait"
                  value={form.excerpt}
                  onChange={handleChange('excerpt')}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 min-h-[120px]"
                  required
                />
                <textarea
                  placeholder="Contenu complet"
                  value={form.content}
                  onChange={handleChange('content')}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 min-h-[200px]"
                  ref={newsContentRef}
                />
                <div className="flex flex-wrap gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => insertMarkdown('## ')}
                    className="rounded-md bg-white/10 px-3 py-1 text-white hover:bg-white/20"
                  >
                    Titre
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('### ')}
                    className="rounded-md bg-white/10 px-3 py-1 text-white hover:bg-white/20"
                  >
                    Sous-titre
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('- ')}
                    className="rounded-md bg-white/10 px-3 py-1 text-white hover:bg-white/20"
                  >
                    Liste
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('> ')}
                    className="rounded-md bg-white/10 px-3 py-1 text-white hover:bg-white/20"
                  >
                    Citation
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('**', '**')}
                    className="rounded-md bg-white/10 px-3 py-1 text-white hover:bg-white/20"
                  >
                    Gras
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('*', '*')}
                    className="rounded-md bg-white/10 px-3 py-1 text-white hover:bg-white/20"
                  >
                    Italique
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('![Legende](https://exemple.com/image.jpg)')}
                    className="rounded-md bg-white/10 px-3 py-1 text-white hover:bg-white/20"
                  >
                    Image
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  Raccourcis markdown: ## Titre, ### Sous-titre, - Liste, &gt; Citation, **gras**, *italique*,
                  ![legende](url "caption").
                </p>
                <input
                  type="url"
                  placeholder="URL de l'image"
                  value={form.image}
                  onChange={handleChange('image')}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
                <input
                  type="date"
                  value={form.date}
                  onChange={handleChange('date')}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                  required
                />
              </div>

              <div className="rounded-lg overflow-hidden border border-white/10">
                <img src={previewImage} alt="Preview" className="h-40 w-full object-cover" />
              </div>

              {error && <div className="text-sm text-red-300">{error}</div>}

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-500 transition-colors disabled:opacity-60"
                >
                  {saving ? 'Sauvegarde...' : editingId ? 'Mettre a jour' : 'Ajouter'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-6 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                  >
                    Annuler
                  </button>
                )}
              </div>
            </form>
          </FadeIn>

          <div className="space-y-4">
            <FadeIn delay={0.4}>
              <div className="glass rounded-lg p-6">
                <div className="text-lg font-semibold text-white mb-4">Articles existants</div>
                {loading && <div className="text-gray-300">Chargement...</div>}
                {!loading && sortedArticles.length === 0 && (
                  <div className="text-gray-300">Aucun article pour le moment.</div>
                )}
                <div className="space-y-4">
                  {sortedArticles.map((article, index) => (
                    <ScaleIn key={article.id} delay={0.5 + index * 0.05}>
                      <div className="rounded-lg border border-white/10 p-4 flex gap-4 items-center">
                        <img
                          src={article.image || '/api/placeholder/600/400'}
                          alt={article.title}
                          className="h-16 w-24 object-cover rounded-md"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-semibold truncate">{article.title}</div>
                          <div className="text-sm text-gray-400">{article.date}</div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(article)}
                            className="px-3 py-1 rounded-md bg-white/10 text-white hover:bg-white/20 transition-colors"
                          >
                            Modifier
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteArticle(article.id)}
                            className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-500 transition-colors"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </ScaleIn>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
          <FadeIn delay={0.3}>
            <div className="glass rounded-lg p-6 space-y-4">
              <div className="text-lg font-semibold text-white">Home - Contenu principal</div>
              {homeLoading ? (
                <div className="text-gray-300">Chargement...</div>
              ) : (
                <>
                  <div className="grid gap-3">
                    <input
                      type="text"
                      placeholder="Label hero"
                      value={homeSettings.heroLabel}
                      onChange={handleHomeSettingsChange('heroLabel')}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                    <input
                      type="text"
                      placeholder="Titre hero"
                      value={homeSettings.heroTitle}
                      onChange={handleHomeSettingsChange('heroTitle')}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                    <textarea
                      placeholder="Texte hero"
                      value={homeSettings.heroExcerpt}
                      onChange={handleHomeSettingsChange('heroExcerpt')}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 min-h-[120px]"
                    />
                    <input
                      type="url"
                      placeholder="Image hero (URL)"
                      value={homeSettings.heroImage}
                      onChange={handleHomeSettingsChange('heroImage')}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      placeholder="CTA principal"
                      value={homeSettings.heroPrimaryLabel}
                      onChange={handleHomeSettingsChange('heroPrimaryLabel')}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                    <input
                      type="text"
                      placeholder="Lien CTA principal"
                      value={homeSettings.heroPrimaryHref}
                      onChange={handleHomeSettingsChange('heroPrimaryHref')}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                    <input
                      type="text"
                      placeholder="CTA secondaire"
                      value={homeSettings.heroSecondaryLabel}
                      onChange={handleHomeSettingsChange('heroSecondaryLabel')}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                    <input
                      type="text"
                      placeholder="Lien CTA secondaire"
                      value={homeSettings.heroSecondaryHref}
                      onChange={handleHomeSettingsChange('heroSecondaryHref')}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </div>

                  <div className="grid gap-3">
                    <input
                      type="text"
                      placeholder="Titre Matchday"
                      value={homeSettings.matchdayTitle}
                      onChange={handleHomeSettingsChange('matchdayTitle')}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                    <textarea
                      placeholder="Sous-titre Matchday"
                      value={homeSettings.matchdaySubtitle}
                      onChange={handleHomeSettingsChange('matchdaySubtitle')}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 min-h-[80px]"
                    />
                    <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3">
                      <div className="text-xs uppercase tracking-widest text-gray-400">
                        Matchday Spotlight (manuel)
                      </div>
                      <input
                        type="text"
                        placeholder="Badge (ex: LIVE EN COURS)"
                        value={homeSettings.matchdayStatusLabel}
                        onChange={handleHomeSettingsChange('matchdayStatusLabel')}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          type="text"
                          placeholder="Equipe domicile"
                          value={homeSettings.matchdayHomeTeam}
                          onChange={handleHomeSettingsChange('matchdayHomeTeam')}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                        />
                        <input
                          type="text"
                          placeholder="Equipe exterieure"
                          value={homeSettings.matchdayAwayTeam}
                          onChange={handleHomeSettingsChange('matchdayAwayTeam')}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                        />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          type="text"
                          placeholder="Competition"
                          value={homeSettings.matchdayCompetition}
                          onChange={handleHomeSettingsChange('matchdayCompetition')}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                        />
                        <input
                          type="text"
                          placeholder="Stade"
                          value={homeSettings.matchdayStadium}
                          onChange={handleHomeSettingsChange('matchdayStadium')}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                        />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          type="text"
                          placeholder="Date (ex: 12 Jan 2026)"
                          value={homeSettings.matchdayDate}
                          onChange={handleHomeSettingsChange('matchdayDate')}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                        />
                        <input
                          type="text"
                          placeholder="Heure (ex: 21:00)"
                          value={homeSettings.matchdayTime}
                          onChange={handleHomeSettingsChange('matchdayTime')}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Score (ex: 2 - 1)"
                        value={homeSettings.matchdayScore}
                        onChange={handleHomeSettingsChange('matchdayScore')}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Titre Fan Zone"
                      value={homeSettings.fanZoneTitle}
                      onChange={handleHomeSettingsChange('fanZoneTitle')}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                    <textarea
                      placeholder="Sous-titre Fan Zone"
                      value={homeSettings.fanZoneSubtitle}
                      onChange={handleHomeSettingsChange('fanZoneSubtitle')}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 min-h-[80px]"
                    />
                    <input
                      type="text"
                      placeholder="Titre Alertes"
                      value={homeSettings.alertsTitle}
                      onChange={handleHomeSettingsChange('alertsTitle')}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                    <textarea
                      placeholder="Sous-titre Alertes"
                      value={homeSettings.alertsSubtitle}
                      onChange={handleHomeSettingsChange('alertsSubtitle')}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 min-h-[80px]"
                    />
                    <input
                      type="text"
                      placeholder="Titre Supporter Hub"
                      value={homeSettings.supporterHubTitle}
                      onChange={handleHomeSettingsChange('supporterHubTitle')}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                    <input
                      type="text"
                      placeholder="Sous-titre Supporter Hub"
                      value={homeSettings.supporterHubSubtitle}
                      onChange={handleHomeSettingsChange('supporterHubSubtitle')}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                    <input
                      type="text"
                      placeholder="Label Player Spotlight"
                      value={homeSettings.spotlightLabel}
                      onChange={handleHomeSettingsChange('spotlightLabel')}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </div>

                  {homeError && <div className="text-sm text-red-300">{homeError}</div>}

                  <button
                    type="button"
                    onClick={saveHomeSettings}
                    disabled={homeSaving}
                    className="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-500 transition-colors disabled:opacity-60"
                  >
                    {homeSaving ? 'Sauvegarde...' : 'Sauvegarder la home'}
                  </button>
                </>
              )}
            </div>
          </FadeIn>

          <FadeIn delay={0.4}>
            <div className="glass rounded-lg p-6 space-y-4">
              <div className="text-lg font-semibold text-white">Apercu Home</div>
              <div className="rounded-lg overflow-hidden border border-white/10">
                <img
                  src={homeSettings.heroImage || '/api/placeholder/1200/700'}
                  alt="Hero preview"
                  className="h-40 w-full object-cover"
                />
              </div>
              <div>
                <div className="text-xs text-gray-400">{homeSettings.heroLabel}</div>
                <div className="text-lg text-white font-semibold">{homeSettings.heroTitle}</div>
                <p className="text-sm text-gray-300">{homeSettings.heroExcerpt}</p>
              </div>
              <div className="rounded-lg bg-white/5 p-4 text-sm text-gray-300">
                <div className="text-white font-semibold">{homeSettings.matchdayTitle}</div>
                <p>{homeSettings.matchdaySubtitle}</p>
              </div>
              <div className="rounded-lg bg-white/5 p-4 text-sm text-gray-300">
                <div className="text-white font-semibold">{homeSettings.fanZoneTitle}</div>
                <p>{homeSettings.fanZoneSubtitle}</p>
              </div>
            </div>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
          <FadeIn delay={0.3}>
            <div className="glass rounded-lg p-6 space-y-4">
              <div className="text-lg font-semibold text-white">Footer - Contenu</div>
              {footerLoading ? (
                <div className="text-gray-300">Chargement...</div>
              ) : (
                <>
                  <div className="grid gap-3">
                    <input
                      type="text"
                      placeholder="Titre"
                      value={footerSettings.brandTitle}
                      onChange={handleFooterSettingsChange('brandTitle')}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                    <textarea
                      placeholder="Texte"
                      value={footerSettings.brandText}
                      onChange={handleFooterSettingsChange('brandText')}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 min-h-[120px]"
                    />
                    <input
                      type="text"
                      placeholder="Titre Alertes"
                      value={footerSettings.alertsTitle}
                      onChange={handleFooterSettingsChange('alertsTitle')}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                    <textarea
                      placeholder="Texte Alertes"
                      value={footerSettings.alertsText}
                      onChange={handleFooterSettingsChange('alertsText')}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 min-h-[100px]"
                    />
                    <input
                      type="text"
                      placeholder="Label bouton Alertes"
                      value={footerSettings.alertsCtaLabel}
                      onChange={handleFooterSettingsChange('alertsCtaLabel')}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                    <input
                      type="text"
                      placeholder="Texte bas de page"
                      value={footerSettings.bottomText}
                      onChange={handleFooterSettingsChange('bottomText')}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </div>

                  {footerError && <div className="text-sm text-red-300">{footerError}</div>}

                  <button
                    type="button"
                    onClick={saveFooterSettings}
                    disabled={footerSaving}
                    className="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-500 transition-colors disabled:opacity-60"
                  >
                    {footerSaving ? 'Sauvegarde...' : 'Sauvegarder le footer'}
                  </button>
                </>
              )}
            </div>
          </FadeIn>

          <FadeIn delay={0.4}>
            <div className="glass rounded-lg p-6 space-y-4">
              <div className="text-lg font-semibold text-white">Apercu Footer</div>
              <div className="rounded-lg bg-white/5 p-4">
                <div className="text-white font-semibold">{footerSettings.brandTitle}</div>
                <p className="text-sm text-gray-300">{footerSettings.brandText}</p>
              </div>
              <div className="rounded-lg bg-white/5 p-4 text-sm text-gray-300">
                <div className="text-white font-semibold">{footerSettings.alertsTitle}</div>
                <p>{footerSettings.alertsText}</p>
                <span className="inline-flex mt-2 rounded-full bg-white/10 px-3 py-1 text-xs text-gray-200">
                  {footerSettings.alertsCtaLabel}
                </span>
              </div>
              <div className="text-xs text-gray-500">{footerSettings.bottomText}</div>
            </div>
          </FadeIn>
        </div>

        <div className="mt-12">
          <FadeIn delay={0.3}>
            <div className="glass rounded-lg p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold text-white">Classements</div>
                  <p className="text-sm text-gray-400">Mise a jour manuelle des tableaux Ligue 1 et C1.</p>
                </div>
                <button
                  type="button"
                  onClick={saveStandings}
                  disabled={standingsSaving}
                  className="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-500 transition-colors disabled:opacity-60"
                >
                  {standingsSaving ? 'Sauvegarde...' : 'Sauvegarder les classements'}
                </button>
              </div>

              {standingsError && <div className="text-sm text-red-300">{standingsError}</div>}

              <div className="grid gap-8 lg:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold">Classement Ligue 1</h3>
                    <button
                      type="button"
                      onClick={() => addStandingsRow('ligue1')}
                      className="text-xs text-red-200 hover:text-red-100"
                    >
                      + Ajouter
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-gray-300">
                      <thead className="text-[11px] uppercase text-gray-400 border-b border-white/10">
                        <tr>
                          <th className="py-2 text-left">#</th>
                          <th className="py-2 text-left">Club</th>
                          <th className="py-2 text-right">Pts</th>
                          <th className="py-2 text-right">J</th>
                          <th className="py-2 text-right">G</th>
                          <th className="py-2 text-right">N</th>
                          <th className="py-2 text-right">P</th>
                          <th className="py-2 text-right">Diff</th>
                          <th className="py-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {standings.ligue1.map((row, index) => (
                          <tr key={`l1-${index}`} className="border-b border-white/5 last:border-0">
                            <td className="py-2 pr-2">
                              <input
                                type="number"
                                value={row.pos}
                                onChange={(event) => updateStandingsRow('ligue1', index, 'pos', event.target.value)}
                                className="w-12 rounded bg-white/10 px-2 py-1 text-gray-200"
                              />
                            </td>
                            <td className="py-2 pr-2">
                              <input
                                type="text"
                                value={row.club}
                                onChange={(event) => updateStandingsRow('ligue1', index, 'club', event.target.value)}
                                className="w-full rounded bg-white/10 px-2 py-1 text-gray-200"
                              />
                            </td>
                            <td className="py-2 pr-2 text-right">
                              <input
                                type="number"
                                value={row.pts}
                                onChange={(event) => updateStandingsRow('ligue1', index, 'pts', event.target.value)}
                                className="w-14 rounded bg-white/10 px-2 py-1 text-right text-gray-200"
                              />
                            </td>
                            <td className="py-2 pr-2 text-right">
                              <input
                                type="number"
                                value={row.j}
                                onChange={(event) => updateStandingsRow('ligue1', index, 'j', event.target.value)}
                                className="w-12 rounded bg-white/10 px-2 py-1 text-right text-gray-200"
                              />
                            </td>
                            <td className="py-2 pr-2 text-right">
                              <input
                                type="number"
                                value={row.g}
                                onChange={(event) => updateStandingsRow('ligue1', index, 'g', event.target.value)}
                                className="w-12 rounded bg-white/10 px-2 py-1 text-right text-gray-200"
                              />
                            </td>
                            <td className="py-2 pr-2 text-right">
                              <input
                                type="number"
                                value={row.n}
                                onChange={(event) => updateStandingsRow('ligue1', index, 'n', event.target.value)}
                                className="w-12 rounded bg-white/10 px-2 py-1 text-right text-gray-200"
                              />
                            </td>
                            <td className="py-2 pr-2 text-right">
                              <input
                                type="number"
                                value={row.p}
                                onChange={(event) => updateStandingsRow('ligue1', index, 'p', event.target.value)}
                                className="w-12 rounded bg-white/10 px-2 py-1 text-right text-gray-200"
                              />
                            </td>
                            <td className="py-2 pr-2 text-right">
                              <input
                                type="text"
                                value={row.diff}
                                onChange={(event) => updateStandingsRow('ligue1', index, 'diff', event.target.value)}
                                className="w-14 rounded bg-white/10 px-2 py-1 text-right text-gray-200"
                              />
                            </td>
                            <td className="py-2 text-right">
                              <button
                                type="button"
                                onClick={() => removeStandingsRow('ligue1', index)}
                                className="text-xs text-red-200 hover:text-red-100"
                              >
                                Supprimer
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold">Classement Ligue des Champions</h3>
                    <button
                      type="button"
                      onClick={() => addStandingsRow('championsLeague')}
                      className="text-xs text-red-200 hover:text-red-100"
                    >
                      + Ajouter
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-gray-300">
                      <thead className="text-[11px] uppercase text-gray-400 border-b border-white/10">
                        <tr>
                          <th className="py-2 text-left">#</th>
                          <th className="py-2 text-left">Club</th>
                          <th className="py-2 text-right">Pts</th>
                          <th className="py-2 text-right">J</th>
                          <th className="py-2 text-right">G</th>
                          <th className="py-2 text-right">N</th>
                          <th className="py-2 text-right">P</th>
                          <th className="py-2 text-right">Diff</th>
                          <th className="py-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {standings.championsLeague.map((row, index) => (
                          <tr key={`ucl-${index}`} className="border-b border-white/5 last:border-0">
                            <td className="py-2 pr-2">
                              <input
                                type="number"
                                value={row.pos}
                                onChange={(event) => updateStandingsRow('championsLeague', index, 'pos', event.target.value)}
                                className="w-12 rounded bg-white/10 px-2 py-1 text-gray-200"
                              />
                            </td>
                            <td className="py-2 pr-2">
                              <input
                                type="text"
                                value={row.club}
                                onChange={(event) => updateStandingsRow('championsLeague', index, 'club', event.target.value)}
                                className="w-full rounded bg-white/10 px-2 py-1 text-gray-200"
                              />
                            </td>
                            <td className="py-2 pr-2 text-right">
                              <input
                                type="number"
                                value={row.pts}
                                onChange={(event) => updateStandingsRow('championsLeague', index, 'pts', event.target.value)}
                                className="w-14 rounded bg-white/10 px-2 py-1 text-right text-gray-200"
                              />
                            </td>
                            <td className="py-2 pr-2 text-right">
                              <input
                                type="number"
                                value={row.j}
                                onChange={(event) => updateStandingsRow('championsLeague', index, 'j', event.target.value)}
                                className="w-12 rounded bg-white/10 px-2 py-1 text-right text-gray-200"
                              />
                            </td>
                            <td className="py-2 pr-2 text-right">
                              <input
                                type="number"
                                value={row.g}
                                onChange={(event) => updateStandingsRow('championsLeague', index, 'g', event.target.value)}
                                className="w-12 rounded bg-white/10 px-2 py-1 text-right text-gray-200"
                              />
                            </td>
                            <td className="py-2 pr-2 text-right">
                              <input
                                type="number"
                                value={row.n}
                                onChange={(event) => updateStandingsRow('championsLeague', index, 'n', event.target.value)}
                                className="w-12 rounded bg-white/10 px-2 py-1 text-right text-gray-200"
                              />
                            </td>
                            <td className="py-2 pr-2 text-right">
                              <input
                                type="number"
                                value={row.p}
                                onChange={(event) => updateStandingsRow('championsLeague', index, 'p', event.target.value)}
                                className="w-12 rounded bg-white/10 px-2 py-1 text-right text-gray-200"
                              />
                            </td>
                            <td className="py-2 pr-2 text-right">
                              <input
                                type="text"
                                value={row.diff}
                                onChange={(event) => updateStandingsRow('championsLeague', index, 'diff', event.target.value)}
                                className="w-14 rounded bg-white/10 px-2 py-1 text-right text-gray-200"
                              />
                            </td>
                            <td className="py-2 text-right">
                              <button
                                type="button"
                                onClick={() => removeStandingsRow('championsLeague', index)}
                                className="text-xs text-red-200 hover:text-red-100"
                              >
                                Supprimer
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        <div className="mt-12">
          <FadeIn delay={0.35}>
            <div className="glass rounded-lg p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold text-white">Buteurs & Passeurs</div>
                  <p className="text-sm text-gray-400">Classements manuels pour la page calendrier.</p>
                </div>
                <button
                  type="button"
                  onClick={saveTopStats}
                  disabled={topStatsSaving}
                  className="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-500 transition-colors disabled:opacity-60"
                >
                  {topStatsSaving ? 'Sauvegarde...' : 'Sauvegarder les tops'}
                </button>
              </div>

              {topStatsError && <div className="text-sm text-red-300">{topStatsError}</div>}

              <div className="grid gap-8 lg:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold">Classement Buteurs</h3>
                    <button
                      type="button"
                      onClick={() => addTopStatsRow('scorers')}
                      className="text-xs text-red-200 hover:text-red-100"
                    >
                      + Ajouter
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-gray-300">
                      <thead className="text-[11px] uppercase text-gray-400 border-b border-white/10">
                        <tr>
                          <th className="py-2 text-left">#</th>
                          <th className="py-2 text-left">Joueur</th>
                          <th className="py-2 text-left">Club</th>
                          <th className="py-2 text-right">Buts</th>
                          <th className="py-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topStats.scorers.map((row, index) => (
                          <tr key={`scorer-${index}`} className="border-b border-white/5 last:border-0">
                            <td className="py-2 pr-2">
                              <input
                                type="number"
                                value={row.pos}
                                onChange={(event) => updateTopStatsRow('scorers', index, 'pos', event.target.value)}
                                className="w-12 rounded bg-white/10 px-2 py-1 text-gray-200"
                              />
                            </td>
                            <td className="py-2 pr-2">
                              <input
                                type="text"
                                value={row.player}
                                onChange={(event) => updateTopStatsRow('scorers', index, 'player', event.target.value)}
                                className="w-full rounded bg-white/10 px-2 py-1 text-gray-200"
                              />
                            </td>
                            <td className="py-2 pr-2">
                              <input
                                type="text"
                                value={row.club}
                                onChange={(event) => updateTopStatsRow('scorers', index, 'club', event.target.value)}
                                className="w-full rounded bg-white/10 px-2 py-1 text-gray-200"
                              />
                            </td>
                            <td className="py-2 pr-2 text-right">
                              <input
                                type="number"
                                value={row.goals}
                                onChange={(event) => updateTopStatsRow('scorers', index, 'goals', event.target.value)}
                                className="w-14 rounded bg-white/10 px-2 py-1 text-right text-gray-200"
                              />
                            </td>
                            <td className="py-2 text-right">
                              <button
                                type="button"
                                onClick={() => removeTopStatsRow('scorers', index)}
                                className="text-xs text-red-200 hover:text-red-100"
                              >
                                Supprimer
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold">Classement Passeurs</h3>
                    <button
                      type="button"
                      onClick={() => addTopStatsRow('assists')}
                      className="text-xs text-red-200 hover:text-red-100"
                    >
                      + Ajouter
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-gray-300">
                      <thead className="text-[11px] uppercase text-gray-400 border-b border-white/10">
                        <tr>
                          <th className="py-2 text-left">#</th>
                          <th className="py-2 text-left">Joueur</th>
                          <th className="py-2 text-left">Club</th>
                          <th className="py-2 text-right">Passes D</th>
                          <th className="py-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topStats.assists.map((row, index) => (
                          <tr key={`assist-${index}`} className="border-b border-white/5 last:border-0">
                            <td className="py-2 pr-2">
                              <input
                                type="number"
                                value={row.pos}
                                onChange={(event) => updateTopStatsRow('assists', index, 'pos', event.target.value)}
                                className="w-12 rounded bg-white/10 px-2 py-1 text-gray-200"
                              />
                            </td>
                            <td className="py-2 pr-2">
                              <input
                                type="text"
                                value={row.player}
                                onChange={(event) => updateTopStatsRow('assists', index, 'player', event.target.value)}
                                className="w-full rounded bg-white/10 px-2 py-1 text-gray-200"
                              />
                            </td>
                            <td className="py-2 pr-2">
                              <input
                                type="text"
                                value={row.club}
                                onChange={(event) => updateTopStatsRow('assists', index, 'club', event.target.value)}
                                className="w-full rounded bg-white/10 px-2 py-1 text-gray-200"
                              />
                            </td>
                            <td className="py-2 pr-2 text-right">
                              <input
                                type="number"
                                value={row.assists}
                                onChange={(event) => updateTopStatsRow('assists', index, 'assists', event.target.value)}
                                className="w-14 rounded bg-white/10 px-2 py-1 text-right text-gray-200"
                              />
                            </td>
                            <td className="py-2 text-right">
                              <button
                                type="button"
                                onClick={() => removeTopStatsRow('assists', index)}
                                className="text-xs text-red-200 hover:text-red-100"
                              >
                                Supprimer
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
          <FadeIn delay={0.3}>
            <form onSubmit={handleMatchSubmit} className="glass rounded-lg p-6 space-y-4">
              <div className="text-lg font-semibold text-white">
                {editingMatchId ? 'Modifier un match' : 'Nouveau match'}
              </div>
              <div className="space-y-3">
                <input
                  type="date"
                  value={matchForm.date}
                  onChange={handleMatchChange('date')}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                  required
                />
                <input
                  type="time"
                  value={matchForm.time}
                  onChange={handleMatchChange('time')}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                  required
                />
                <input
                  type="text"
                  placeholder="Equipe domicile"
                  value={matchForm.home}
                  onChange={handleMatchChange('home')}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                  required
                />
                <input
                  type="text"
                  placeholder="Equipe exterieure"
                  value={matchForm.away}
                  onChange={handleMatchChange('away')}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                  required
                />
                <input
                  type="text"
                  placeholder="Competition"
                  value={matchForm.competition}
                  onChange={handleMatchChange('competition')}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                  required
                />
                <input
                  type="text"
                  placeholder="Stade"
                  value={matchForm.stadium}
                  onChange={handleMatchChange('stadium')}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                  required
                />
                <select
                  value={matchForm.status}
                  onChange={handleMatchChange('status')}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  <option value="upcoming" className="bg-blue-900">A venir</option>
                  <option value="played" className="bg-blue-900">Joue</option>
                </select>
                <input
                  type="text"
                  placeholder="Score (ex: 2-1)"
                  value={matchForm.score}
                  onChange={handleMatchChange('score')}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
                <select
                  value={matchForm.result}
                  onChange={handleMatchChange('result')}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  <option value="" className="bg-blue-900">Resultat</option>
                  <option value="W" className="bg-blue-900">Victoire</option>
                  <option value="D" className="bg-blue-900">Nul</option>
                  <option value="L" className="bg-blue-900">Defaite</option>
                </select>
              </div>

              {matchError && <div className="text-sm text-red-300">{matchError}</div>}

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={matchSaving}
                  className="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-500 transition-colors disabled:opacity-60"
                >
                  {matchSaving ? 'Sauvegarde...' : editingMatchId ? 'Mettre a jour' : 'Ajouter'}
                </button>
                {editingMatchId && (
                  <button
                    type="button"
                    onClick={cancelMatchEdit}
                    className="px-6 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                  >
                    Annuler
                  </button>
                )}
              </div>
            </form>
          </FadeIn>

          <div className="space-y-4">
            <FadeIn delay={0.4}>
              <div className="glass rounded-lg p-6">
                <div className="text-lg font-semibold text-white mb-4">Calendrier complet</div>
                {matchesLoading && <div className="text-gray-300">Chargement...</div>}
                {!matchesLoading && sortedMatches.length === 0 && (
                  <div className="text-gray-300">Aucun match pour le moment.</div>
                )}
                <div className="space-y-4">
                  {sortedMatches.map((match, index) => (
                    <ScaleIn key={match.id} delay={0.5 + index * 0.05}>
                      <div className="rounded-lg border border-white/10 p-4 flex gap-4 items-center">
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-semibold truncate">
                            {match.home} vs {match.away}
                          </div>
                          <div className="text-sm text-gray-400">{match.date} - {match.time}</div>
                          <div className="text-sm text-gray-400">{match.competition}</div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startMatchEdit(match)}
                            className="px-3 py-1 rounded-md bg-white/10 text-white hover:bg-white/20 transition-colors"
                          >
                            Modifier
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteMatch(match.id)}
                            className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-500 transition-colors"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </ScaleIn>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
          <FadeIn delay={0.3}>
            <form onSubmit={handleFanWallSubmit} className="glass rounded-lg p-6 space-y-4">
              <div className="text-lg font-semibold text-white">
                {editingFanWallId !== null ? 'Modifier un message fan wall' : 'Nouveau message fan wall'}
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Nom"
                  value={fanWallForm.name}
                  onChange={handleFanWallChange('name')}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                  required
                />
                <input
                  type="text"
                  placeholder="@handle"
                  value={fanWallForm.handle}
                  onChange={handleFanWallChange('handle')}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
                <input
                  type="text"
                  placeholder="Temps (ex: 6 min)"
                  value={fanWallForm.time}
                  onChange={handleFanWallChange('time')}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
                <textarea
                  placeholder="Message"
                  value={fanWallForm.message}
                  onChange={handleFanWallChange('message')}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 min-h-[120px]"
                  required
                />
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={fanWallForm.approved}
                    onChange={handleFanWallChange('approved')}
                    className="h-4 w-4 rounded border-white/20 bg-white/10 text-red-500 focus:ring-red-400"
                  />
                  Publie
                </label>
              </div>

              {fanWallError && <div className="text-sm text-red-300">{fanWallError}</div>}

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-500 transition-colors"
                >
                  {editingFanWallId !== null ? 'Mettre a jour' : 'Ajouter'}
                </button>
                {editingFanWallId !== null && (
                  <button
                    type="button"
                    onClick={cancelFanWallEdit}
                    className="px-6 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                  >
                    Annuler
                  </button>
                )}
                <button
                  type="button"
                  onClick={saveFanWall}
                  disabled={fanWallSaving}
                  className="px-6 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors disabled:opacity-60"
                >
                  {fanWallSaving ? 'Sauvegarde...' : 'Sauvegarder la fan zone'}
                </button>
              </div>
            </form>
          </FadeIn>

          <div className="space-y-4">
            <FadeIn delay={0.4}>
              <div className="glass rounded-lg p-6">
                <div className="text-lg font-semibold text-white mb-4">Fan wall</div>
                {fanWallLoading && <div className="text-gray-300">Chargement...</div>}
                {!fanWallLoading && sortedFanWall.length === 0 && (
                  <div className="text-gray-300">Aucun message pour le moment.</div>
                )}
                <div className="space-y-4">
                  {sortedFanWall.map((post, index) => (
                    <ScaleIn key={post.id} delay={0.5 + index * 0.05}>
                      <div className="rounded-lg border border-white/10 p-4 flex gap-4 items-center">
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-semibold truncate">{post.name}</div>
                          <div className="text-sm text-gray-400">
                            {post.handle} · {post.time || 'maintenant'}
                          </div>
                          <div className="text-sm text-gray-400 truncate">{post.message}</div>
                          <div className="mt-2 text-xs">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 ${
                                post.approved ? 'bg-green-500/20 text-green-200' : 'bg-yellow-500/20 text-yellow-200'
                              }`}
                            >
                              {post.approved ? 'Publie' : 'En attente'}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startFanWallEdit(post)}
                            className="px-3 py-1 rounded-md bg-white/10 text-white hover:bg-white/20 transition-colors"
                          >
                            Modifier
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleFanWallApproval(post.id)}
                            className="px-3 py-1 rounded-md bg-white/10 text-white hover:bg-white/20 transition-colors"
                          >
                            {post.approved ? 'Retirer' : 'Publier'}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteFanWallPost(post.id)}
                            className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-500 transition-colors"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </ScaleIn>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
          <FadeIn delay={0.3}>
            <form onSubmit={handleLiveEventSubmit} className="glass rounded-lg p-6 space-y-4">
              <div className="text-lg font-semibold text-white">
                {editingLiveEventIndex !== null ? 'Modifier un evenement live' : 'Nouvel evenement live'}
              </div>
              <div className="space-y-3">
                <input
                  type="number"
                  min="0"
                  placeholder="Minute (ex: 67)"
                  value={liveEventForm.minute}
                  onChange={handleLiveEventChange('minute')}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                  required
                />
                <input
                  type="text"
                  placeholder="Equipe"
                  value={liveEventForm.team}
                  onChange={handleLiveEventChange('team')}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                  required
                />
                <select
                  value={liveEventForm.type}
                  onChange={handleLiveEventChange('type')}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  <option value="goal" className="bg-blue-900">But</option>
                  <option value="card" className="bg-blue-900">Carton</option>
                  <option value="substitution" className="bg-blue-900">Changement</option>
                  <option value="chance" className="bg-blue-900">Occasion</option>
                </select>
                <input
                  type="text"
                  placeholder="Joueur"
                  value={liveEventForm.player}
                  onChange={handleLiveEventChange('player')}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                  required
                />
                <textarea
                  placeholder="Detail de l'action"
                  value={liveEventForm.detail}
                  onChange={handleLiveEventChange('detail')}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 min-h-[100px]"
                  required
                />
              </div>

              {liveError && <div className="text-sm text-red-300">{liveError}</div>}

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-500 transition-colors"
                >
                  {editingLiveEventIndex !== null ? 'Mettre a jour' : 'Ajouter'}
                </button>
                {editingLiveEventIndex !== null && (
                  <button
                    type="button"
                    onClick={cancelLiveEventEdit}
                    className="px-6 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                  >
                    Annuler
                  </button>
                )}
                <button
                  type="button"
                  onClick={saveLiveTimeline}
                  disabled={liveSaving}
                  className="px-6 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors disabled:opacity-60"
                >
                  {liveSaving ? 'Sauvegarde...' : 'Sauvegarder la timeline'}
                </button>
              </div>
            </form>
          </FadeIn>

          <div className="space-y-4">
            <FadeIn delay={0.4}>
              <div className="glass rounded-lg p-6">
                <div className="text-lg font-semibold text-white mb-4">Timeline live</div>
                {liveLoading && <div className="text-gray-300">Chargement...</div>}
                {!liveLoading && sortedLiveEvents.length === 0 && (
                  <div className="text-gray-300">Aucun evenement pour le moment.</div>
                )}
                <div className="space-y-4">
                  {sortedLiveEvents.map(({ eventItem, index }) => (
                    <ScaleIn key={`${eventItem.minute}-${eventItem.player}-${index}`} delay={0.5 + index * 0.05}>
                      <div className="rounded-lg border border-white/10 p-4 flex gap-4 items-center">
                        <div className="text-white font-semibold w-12 text-center">{eventItem.minute}&apos;</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-semibold truncate">{eventItem.player}</div>
                          <div className="text-sm text-gray-400">
                            {eventItem.team} · {eventItem.type}
                          </div>
                          <div className="text-sm text-gray-400 truncate">{eventItem.detail}</div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startLiveEventEdit(eventItem, index)}
                            className="px-3 py-1 rounded-md bg-white/10 text-white hover:bg-white/20 transition-colors"
                          >
                            Modifier
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteLiveEvent(index)}
                            className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-500 transition-colors"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </ScaleIn>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
          <FadeIn delay={0.3}>
            <form onSubmit={handlePlayerSubmit} className="glass rounded-lg p-6 space-y-4">
              <div className="text-lg font-semibold text-white">
                {editingPlayerId ? 'Modifier un joueur' : 'Nouveau joueur'}
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Nom du joueur"
                  value={playerForm.name}
                  onChange={handlePlayerChange('name')}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                  required
                />
                <input
                  type="text"
                  placeholder="Poste"
                  value={playerForm.position}
                  onChange={handlePlayerChange('position')}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                  required
                />
                <select
                  value={playerForm.group}
                  onChange={handlePlayerChange('group')}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  <option value="goalkeeper" className="bg-blue-900">Gardien</option>
                  <option value="defender" className="bg-blue-900">Defenseur</option>
                  <option value="midfielder" className="bg-blue-900">Milieu</option>
                  <option value="forward" className="bg-blue-900">Attaquant</option>
                </select>
                <input
                  type="number"
                  min="0"
                  placeholder="Numero"
                  value={playerForm.number}
                  onChange={handlePlayerChange('number')}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                  required
                />
                <input
                  type="text"
                  placeholder="Nationalite"
                  value={playerForm.nationality}
                  onChange={handlePlayerChange('nationality')}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                  required
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Age"
                  value={playerForm.age}
                  onChange={handlePlayerChange('age')}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                  required
                />
                <input
                  type="url"
                  placeholder="URL photo"
                  value={playerForm.image}
                  onChange={handlePlayerChange('image')}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>

              <div className="rounded-lg overflow-hidden border border-white/10">
                <img src={previewPlayerImage} alt="Preview joueur" className="h-40 w-full object-cover" />
              </div>

              {playerError && <div className="text-sm text-red-300">{playerError}</div>}

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={playerSaving}
                  className="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-500 transition-colors disabled:opacity-60"
                >
                  {playerSaving ? 'Sauvegarde...' : editingPlayerId ? 'Mettre a jour' : 'Ajouter'}
                </button>
                {editingPlayerId && (
                  <button
                    type="button"
                    onClick={cancelPlayerEdit}
                    className="px-6 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                  >
                    Annuler
                  </button>
                )}
              </div>
            </form>
          </FadeIn>

          <div className="space-y-4">
            <FadeIn delay={0.4}>
              <div className="glass rounded-lg p-6">
                <div className="text-lg font-semibold text-white mb-4">Effectif</div>
                {squadLoading && <div className="text-gray-300">Chargement...</div>}
                {!squadLoading && sortedPlayers.length === 0 && (
                  <div className="text-gray-300">Aucun joueur pour le moment.</div>
                )}
                <div className="space-y-4">
                  {sortedPlayers.map((player, index) => (
                    <ScaleIn key={player.id} delay={0.5 + index * 0.05}>
                      <div className="rounded-lg border border-white/10 p-4 flex gap-4 items-center">
                        <img
                          src={player.image || '/api/placeholder/300/400'}
                          alt={player.name}
                          className="h-16 w-12 object-cover rounded-md"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-semibold truncate">#{player.number} {player.name}</div>
                          <div className="text-sm text-gray-400">{player.position} · {player.nationality}</div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startPlayerEdit(player)}
                            className="px-3 py-1 rounded-md bg-white/10 text-white hover:bg-white/20 transition-colors"
                          >
                            Modifier
                          </button>
                          <button
                            type="button"
                            onClick={() => deletePlayer(player.id)}
                            className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-500 transition-colors"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </ScaleIn>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
          <FadeIn delay={0.3}>
            <form onSubmit={handleStaffSubmit} className="glass rounded-lg p-6 space-y-4">
              <div className="text-lg font-semibold text-white">
                {editingStaffId ? 'Modifier un membre du staff' : 'Nouveau membre du staff'}
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Nom"
                  value={staffForm.name}
                  onChange={handleStaffChange('name')}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                  required
                />
                <input
                  type="text"
                  placeholder="Role"
                  value={staffForm.role}
                  onChange={handleStaffChange('role')}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                  required
                />
                <input
                  type="text"
                  placeholder="Nationalite"
                  value={staffForm.nationality}
                  onChange={handleStaffChange('nationality')}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                  required
                />
                <input
                  type="url"
                  placeholder="URL photo"
                  value={staffForm.image}
                  onChange={handleStaffChange('image')}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>

              <div className="rounded-lg overflow-hidden border border-white/10">
                <img src={previewStaffImage} alt="Preview staff" className="h-40 w-full object-cover" />
              </div>

              {staffError && <div className="text-sm text-red-300">{staffError}</div>}

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={staffSaving}
                  className="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-500 transition-colors disabled:opacity-60"
                >
                  {staffSaving ? 'Sauvegarde...' : editingStaffId ? 'Mettre a jour' : 'Ajouter'}
                </button>
                {editingStaffId && (
                  <button
                    type="button"
                    onClick={cancelStaffEdit}
                    className="px-6 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                  >
                    Annuler
                  </button>
                )}
              </div>
            </form>
          </FadeIn>

          <div className="space-y-4">
            <FadeIn delay={0.4}>
              <div className="glass rounded-lg p-6">
                <div className="text-lg font-semibold text-white mb-4">Staff</div>
                {squadLoading && <div className="text-gray-300">Chargement...</div>}
                {!squadLoading && sortedStaff.length === 0 && (
                  <div className="text-gray-300">Aucun membre du staff pour le moment.</div>
                )}
                <div className="space-y-4">
                  {sortedStaff.map((member, index) => (
                    <ScaleIn key={member.id} delay={0.5 + index * 0.05}>
                      <div className="rounded-lg border border-white/10 p-4 flex gap-4 items-center">
                        <img
                          src={member.image || '/api/placeholder/300/400'}
                          alt={member.name}
                          className="h-16 w-12 object-cover rounded-md"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-semibold truncate">{member.name}</div>
                          <div className="text-sm text-gray-400">{member.role} · {member.nationality}</div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startStaffEdit(member)}
                            className="px-3 py-1 rounded-md bg-white/10 text-white hover:bg-white/20 transition-colors"
                          >
                            Modifier
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteStaff(member.id)}
                            className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-500 transition-colors"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </ScaleIn>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  );
}
