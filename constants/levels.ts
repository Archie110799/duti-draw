export type LevelRegion = {
  id: string;
  label: string;
  path: string | null;
};

export type LevelConfig = {
  levelNumber: number;
  title: string;
  animal: string;
  symbolId: string;
  palette: string[];
  regions: LevelRegion[];
};

export type LevelsFile = {
  schemaVersion: number;
  levels: LevelConfig[];
};

export const LEVELS_FILE = require('@/assets/levels/levels-20.json') as LevelsFile;

export function getLevelByNumber(levelNumber: number): LevelConfig | undefined {
  return LEVELS_FILE.levels.find((l) => l.levelNumber === levelNumber);
}

export const LEVEL_COUNT = LEVELS_FILE.levels.length;
