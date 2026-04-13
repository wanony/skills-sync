import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import matter from 'gray-matter';

export const SOURCE_DIR = path.join(process.cwd(), 'skills');

export const getToolPaths = () => {
  const home = os.homedir();
  const isWindows = process.platform === 'win32';
  
  const paths = [
    { name: 'Claude', path: path.join(home, '.claude', 'skills') },
    { name: 'Gemini', path: path.join(home, '.gemini', 'skills') },
    { name: 'Codex', path: path.join(home, '.codex', 'skills') },
    {
      name: 'OpenCode',
      path: isWindows 
        ? path.join(process.env.APPDATA || path.join(home, 'AppData', 'Roaming'), 'opencode', 'skills')
        : path.join(home, '.config', 'opencode', 'skills')
    }
  ];
  return paths;
};

export async function sync() {
  console.log('Starting sync...');

  if (!await fs.pathExists(SOURCE_DIR)) {
    console.warn(`Warning: SOURCE_DIR "${SOURCE_DIR}" does not exist. No skills to sync.`);
    return;
  }

  const toolPaths = getToolPaths();
  const skillFiles = await fs.readdir(SOURCE_DIR);
  const mdFiles = skillFiles.filter(f => f.endsWith('.md'));
  const currentSkillNames = mdFiles.map(f => path.parse(f).name);

  for (const file of mdFiles) {
    const filePath = path.join(SOURCE_DIR, file);
    const content = await fs.readFile(filePath, 'utf-8');
    const skillName = path.parse(file).name;
    
    // Parse existing frontmatter and content
    const parsed = matter(content);
    const data = parsed.data;
    
    // Ensure name and description are present
    const name = data.name || skillName;
    const description = data.description || parsed.content.split('\n').find(l => l.trim() && !l.startsWith('#'))?.trim() || 'Custom skill';

    const skillContent = matter.stringify(parsed.content, {
      ...data,
      name,
      description
    });

    for (const tool of toolPaths) {
      const targetDir = path.join(tool.path, skillName);
      const targetFile = path.join(targetDir, 'SKILL.md');

      try {
        await fs.ensureDir(targetDir);
        await fs.writeFile(targetFile, skillContent);
        console.log(`Synced ${skillName} to ${tool.name}`);
      } catch (err) {
        console.error(`Failed to sync to ${tool.name}: ${err}`);
      }
    }
  }

  // Cleanup: Remove stale skills from target directories
  for (const tool of toolPaths) {
    if (await fs.pathExists(tool.path)) {
      const targetSkills = await fs.readdir(tool.path);
      for (const targetSkill of targetSkills) {
        if (!currentSkillNames.includes(targetSkill)) {
          const targetDir = path.join(tool.path, targetSkill);
          const skillFile = path.join(targetDir, 'SKILL.md');
          
          // Only cleanup if the directory contains a SKILL.md file
          if (await fs.pathExists(skillFile)) {
            try {
              await fs.remove(targetDir);
              console.log(`Cleaned up stale skill ${targetSkill} from ${tool.name}`);
            } catch (err) {
              console.error(`Failed to cleanup ${targetSkill} from ${tool.name}: ${err}`);
            }
          } else {
            console.log(`Skipping cleanup for ${targetSkill} in ${tool.name} (no SKILL.md found)`);
          }
        }
      }
    }
  }

  console.log('Sync complete!');
}

if (require.main === module) {
  sync().catch(console.error);
}
