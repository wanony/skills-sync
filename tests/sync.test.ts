import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { sync, getToolPaths, SOURCE_DIR } from '../src/sync';

jest.mock('fs-extra');
jest.mock('os');

describe('sync', () => {
  const mockedFs = fs as any;
  const mockedOs = os as any;

  let originalPlatform: string;

  beforeAll(() => {
    originalPlatform = process.platform;
  });

  afterAll(() => {
    Object.defineProperty(process, 'platform', {
      value: originalPlatform
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockedOs.homedir.mockReturnValue('/home/user');
    Object.defineProperty(process, 'platform', {
      value: 'linux',
      configurable: true
    });
  });

  it('should get correct tool paths', () => {
    const paths = getToolPaths();
    expect(paths).toContainEqual({ name: 'Claude', path: '/home/user/.claude/skills' });
    expect(paths).toContainEqual({ name: 'Gemini', path: '/home/user/.gemini/skills' });
  });

  it('should sync skills from source to tool paths', async () => {
    mockedFs.pathExists.mockResolvedValue(true);
    mockedFs.readdir.mockResolvedValue(['test-skill.md']);
    mockedFs.readFile.mockResolvedValue('---\nname: Test Skill\n---\nContent');

    await sync();

    const toolPaths = getToolPaths();
    for (const tool of toolPaths) {
      const targetDir = path.join(tool.path, 'test-skill');
      const targetFile = path.join(targetDir, 'SKILL.md');
      expect(mockedFs.ensureDir).toHaveBeenCalledWith(targetDir);
      expect(mockedFs.writeFile).toHaveBeenCalledWith(targetFile, expect.stringContaining('name: Test Skill'));
    }
  });

  it('should extract metadata if missing from frontmatter', async () => {
    mockedFs.pathExists.mockResolvedValue(true);
    mockedFs.readdir.mockResolvedValue(['no-meta.md']);
    mockedFs.readFile.mockResolvedValue('# No Meta\nSome description here');

    await sync();

    expect(mockedFs.writeFile).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('name: no-meta')
    );
    expect(mockedFs.writeFile).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('description: Some description here')
    );
  });

  it('should cleanup stale skills that contain SKILL.md', async () => {
    mockedFs.pathExists.mockImplementation(async (p: string) => {
      if (p === SOURCE_DIR) return true;
      if (p.endsWith('stale-skill/SKILL.md')) return true;
      if (p.endsWith('keep-me/SKILL.md')) return false;
      return true;
    });
    
    mockedFs.readdir.mockImplementation(async (p: string) => {
      if (p === SOURCE_DIR) return ['active-skill.md'];
      if (p.endsWith('/skills')) return ['active-skill', 'stale-skill', 'keep-me'];
      return [];
    });
    
    mockedFs.readFile.mockResolvedValue('# Active\nContent');

    await sync();

    // Should remove stale-skill because it has SKILL.md
    expect(mockedFs.remove).toHaveBeenCalledWith(expect.stringContaining('stale-skill'));
    
    // Should NOT remove keep-me because it doesn't have SKILL.md (mocked pathExists as false)
    expect(mockedFs.remove).not.toHaveBeenCalledWith(expect.stringContaining('keep-me'));
  });
});
