#!/usr/bin/env tsx
/// <reference types="node" />

import { execSync } from 'child_process';
import { readdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

const AVAILABLE_SUBGRAPHS = ['analytics', 'farming', 'blocks', 'limits'];

function getNetworkFromSubgraph(subgraph: string): string | null {
  const subgraphDir = join(__dirname, '..', 'subgraphs', subgraph);
  const subgraphYaml = join(subgraphDir, 'subgraph.yaml');
  
  if (!existsSync(subgraphYaml)) {
    return null;
  }
  
  try {
    const content = readFileSync(subgraphYaml, 'utf8');
    const networkMatch = content.match(/network:\s*(\S+)/);
    return networkMatch ? networkMatch[1] : null;
  } catch (error) {
    return null;
  }
}

function buildAllSubgraphs(subgraphs?: string[]): boolean {
  const targetSubgraphs = subgraphs || AVAILABLE_SUBGRAPHS;
  console.log(`🔨 Building ${targetSubgraphs.length} subgraphs...`);
  
  let successCount = 0;
  let failureCount = 0;
  const results: { subgraph: string; success: boolean; network?: string }[] = [];
  
  for (const subgraph of targetSubgraphs) {
    // Detect network from subgraph.yaml
    const network = getNetworkFromSubgraph(subgraph);
    if (!network) {
      console.error(`❌ Could not detect network for ${subgraph}. Run: yarn prepare-network <network>`);
      failureCount++;
      results.push({ subgraph, success: false });
      continue;
    }
    
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🔨 Building ${subgraph} subgraph (${network})...`);
    console.log(`${'='.repeat(50)}`);
    
    try {
      execSync(`yarn build-subgraph ${subgraph}`, { 
        stdio: 'inherit',
        cwd: join(__dirname, '..')
      });
      
      console.log(`✅ ${subgraph} subgraph built successfully`);
      successCount++;
      results.push({ subgraph, success: true, network });
    } catch (error) {
      console.error(`❌ Failed to build ${subgraph} subgraph`);
      failureCount++;
      results.push({ subgraph, success: false, network });
    }
  }
  
  // Print summary
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 BUILD SUMMARY`);
  console.log(`${'='.repeat(60)}`);
  console.log(`✅ Successful builds: ${successCount}`);
  console.log(`❌ Failed builds: ${failureCount}`);
  console.log(`📋 Total builds: ${targetSubgraphs.length}`);
  
  console.log(`\n📋 Detailed results:`);
  for (const result of results) {
    const status = result.success ? '✅' : '❌';
    const networkInfo = result.network ? ` (${result.network})` : '';
    console.log(`  ${status} ${result.subgraph}${networkInfo}`);
  }
  
  if (failureCount > 0) {
    console.log(`\n⚠️  Some builds failed. Check the logs above for details.`);
  } else {
    console.log(`\n🎉 All subgraphs built successfully!`);
  }
  
  return failureCount === 0;
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 0) {
    console.log(`
📖 Usage: yarn build-all [subgraph1] [subgraph2] ...

📋 Available subgraphs: ${AVAILABLE_SUBGRAPHS.join(', ')}

📝 Examples:
  yarn build-all                    # Build all subgraphs
  yarn build-all analytics farming       # Build only analytics and farming subgraphs
  yarn build-all blocks              # Build only blocks subgraph

💡 Networks will be automatically detected from existing subgraph.yaml files.
   If subgraph.yaml doesn't exist, run: yarn prepare-network <network> first.
    `);
    process.exit(1);
  }
  
  const subgraphs = args;
  
  // Validate subgraphs if specified
  if (subgraphs.length > 0) {
    for (const subgraph of subgraphs) {
      if (!AVAILABLE_SUBGRAPHS.includes(subgraph)) {
        console.error(`❌ Invalid subgraph: ${subgraph}`);
        console.log(`📋 Available subgraphs: ${AVAILABLE_SUBGRAPHS.join(', ')}`);
        process.exit(1);
      }
    }
  }
  
  const success = buildAllSubgraphs(subgraphs.length > 0 ? subgraphs : undefined);
  process.exit(success ? 0 : 1);
}

// Run if this file is executed directly
main();
