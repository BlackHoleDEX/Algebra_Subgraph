#!/usr/bin/env tsx
/// <reference types="node" />

import { execSync } from 'child_process';
import { readdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

const AVAILABLE_SUBGRAPHS = ['core', 'farming', 'blocks', 'limits'];

function getAvailableNetworks(): string[] {
  const configDir = join(__dirname, '..', 'config');
  if (!existsSync(configDir)) {
    console.error('❌ Config directory not found');
    process.exit(1);
  }
  
  return readdirSync(configDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
}

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

function deployAllSubgraphs(namePrefix: string, subgraphs?: string[], accessToken?: string): boolean {
  const targetSubgraphs = subgraphs || AVAILABLE_SUBGRAPHS;
  console.log(`🚀 Deploying ${targetSubgraphs.length} subgraphs...`);
  
  let successCount = 0;
  let failureCount = 0;
  const results: { subgraph: string; success: boolean; name: string; network?: string }[] = [];
  
  for (const subgraph of targetSubgraphs) {
    // Detect network from subgraph.yaml
    const network = getNetworkFromSubgraph(subgraph);
    if (!network) {
      console.error(`❌ Could not detect network for ${subgraph}. Run: yarn prepare-network <network>`);
      failureCount++;
      results.push({ subgraph, success: false, name: 'N/A' });
      continue;
    }
    
    const subgraphName = `${namePrefix}-${subgraph}-${network}`;
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚀 Deploying ${subgraph} subgraph (${network}) to ${subgraphName}...`);
    console.log(`${'='.repeat(60)}`);
    
    try {
      const deployCmd = accessToken 
        ? `yarn deploy-subgraph ${subgraph} ${subgraphName} ${accessToken}`
        : `yarn deploy-subgraph ${subgraph} ${subgraphName}`;
        
      execSync(deployCmd, { 
        stdio: 'inherit',
        cwd: join(__dirname, '..')
      });
      
      console.log(`✅ ${subgraph} subgraph deployed successfully to ${subgraphName}`);
      successCount++;
      results.push({ subgraph, success: true, name: subgraphName, network });
    } catch (error) {
      console.error(`❌ Failed to deploy ${subgraph} subgraph`);
      failureCount++;
      results.push({ subgraph, success: false, name: subgraphName, network });
    }
  }
  
  // Print summary
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📊 DEPLOYMENT SUMMARY`);
  console.log(`${'='.repeat(70)}`);
  console.log(`✅ Successful deployments: ${successCount}`);
  console.log(`❌ Failed deployments: ${failureCount}`);
  console.log(`📋 Total deployments: ${targetSubgraphs.length}`);
  
  console.log(`\n📋 Detailed results:`);
  for (const result of results) {
    const status = result.success ? '✅' : '❌';
    const networkInfo = result.network ? ` (${result.network})` : '';
    console.log(`  ${status} ${result.subgraph}${networkInfo} → ${result.name}`);
  }
  
  if (failureCount > 0) {
    console.log(`\n⚠️  Some deployments failed. Check the logs above for details.`);
  } else {
    console.log(`\n🎉 All subgraphs deployed successfully!`);
    console.log(`\n🔗 Your subgraphs:`);
    for (const result of results.filter(r => r.success)) {
      console.log(`  • ${result.subgraph}: https://thegraph.com/studio/subgraph/${result.name}/`);
    }
  }
  
  return failureCount === 0;
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log(`
📖 Usage: yarn deploy-all <name-prefix> [subgraph1] [subgraph2] ... [access-token]

📋 Available subgraphs: ${AVAILABLE_SUBGRAPHS.join(', ')}

📝 Examples:
  yarn deploy-all algebra                        # Deploy all subgraphs with prefix "algebra"
  yarn deploy-all algebra-testnet                # Deploy all with prefix "algebra-testnet"
  yarn deploy-all algebra core farming           # Deploy only core and farming
  yarn deploy-all algebra core YOUR_ACCESS_TOKEN # Deploy core with access token

💡 Networks will be automatically detected from existing subgraph.yaml files.
   Subgraphs will be named: <name-prefix>-<subgraph>-<network>
   Example: algebra-core-base-sepolia, algebra-farming-base-sepolia, etc.

🔑 You can also set GRAPH_ACCESS_TOKEN environment variable instead of passing it as argument.
    `);
    process.exit(1);
  }
  
  const [namePrefix, ...rest] = args;
  
  // Parse remaining arguments - last one might be access token if it looks like one
  let subgraphs: string[] = [];
  let accessTokenArg: string | undefined;
  
  // Check if last argument is likely an access token (long string)
  if (rest.length > 0 && rest[rest.length - 1].length > 20 && !AVAILABLE_SUBGRAPHS.includes(rest[rest.length - 1])) {
    accessTokenArg = rest.pop();
  }
  
  subgraphs = rest;
  
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
  
  // Get access token from argument or environment
  const accessToken = accessTokenArg || process.env.GRAPH_ACCESS_TOKEN;
  
  if (!accessToken) {
    console.log(`⚠️  No access token provided. Make sure you're authenticated with The Graph CLI.`);
    console.log(`💡 You can set GRAPH_ACCESS_TOKEN environment variable or pass it as the last argument.`);
  }
  
  const success = deployAllSubgraphs(namePrefix, subgraphs.length > 0 ? subgraphs : undefined, accessToken);
  process.exit(success ? 0 : 1);
}

// Run if this file is executed directly
main();
