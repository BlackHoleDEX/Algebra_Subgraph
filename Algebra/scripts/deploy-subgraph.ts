#!/usr/bin/env tsx
/// <reference types="node" />

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
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

function deploySubgraph(
  subgraph: string, 
  subgraphName: string, 
  accessToken?: string
): boolean {
  const subgraphDir = join(__dirname, '..', 'subgraphs', subgraph);
  
  if (!existsSync(subgraphDir)) {
    console.error(`❌ Subgraph directory not found: ${subgraphDir}`);
    return false;
  }
  
  // Check if subgraph.yaml exists
  const subgraphYaml = join(subgraphDir, 'subgraph.yaml');
  if (!existsSync(subgraphYaml)) {
    console.error(`❌ subgraph.yaml not found for ${subgraph}. Run: yarn prepare-network <network>`);
    return false;
  }
  
  // Detect network from subgraph.yaml
  const network = getNetworkFromSubgraph(subgraph);
  if (!network) {
    console.error(`❌ Could not detect network from subgraph.yaml`);
    return false;
  }
  
  console.log(`🚀 Deploying ${subgraph} subgraph (network: ${network}) to ${subgraphName}...`);

  try {
    if (accessToken) {
      console.log(`🔑 Setting access token...`);
      execSync(`graph auth --studio ${accessToken}`, { 
        stdio: 'inherit',
        cwd: subgraphDir
      });
    }
    
    console.log(`📤 Deploying to The Graph Studio...`);
    execSync(`graph deploy --studio ${subgraphName}`, { 
      stdio: 'inherit',
      cwd: subgraphDir
    });
    
    console.log(`✅ Successfully deployed ${subgraph} subgraph to ${subgraphName}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to deploy ${subgraph} subgraph:`, error);
    return false;
  }
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log(`
📖 Usage: yarn deploy-subgraph <subgraph> <subgraph-name> [access-token]

📋 Available subgraphs: ${AVAILABLE_SUBGRAPHS.join(', ')}

📝 Examples:
  yarn deploy-subgraph analytics algebra-analytics-base-sepolia
  yarn deploy-subgraph farming algebra-farming-base-sepolia  
  yarn deploy-subgraph blocks algebra-blocks-base-sepolia YOUR_ACCESS_TOKEN

💡 The network will be automatically detected from the existing subgraph.yaml file.
   If subgraph.yaml doesn't exist, run: yarn prepare-network <network> first.

🔑 You can also set GRAPH_ACCESS_TOKEN environment variable instead of passing it as argument.
    `);
    process.exit(1);
  }
  
  const [subgraph, subgraphName, accessTokenArg] = args;
  
  // Validate subgraph
  if (!AVAILABLE_SUBGRAPHS.includes(subgraph)) {
    console.error(`❌ Invalid subgraph: ${subgraph}`);
    console.log(`📋 Available subgraphs: ${AVAILABLE_SUBGRAPHS.join(', ')}`);
    process.exit(1);
  }
  
  // Get access token from argument or environment
  const accessToken = accessTokenArg || process.env.GRAPH_ACCESS_TOKEN;
  
  if (!accessToken) {
    console.log(`⚠️  No access token provided. Make sure you're authenticated with The Graph CLI.`);
    console.log(`💡 You can set GRAPH_ACCESS_TOKEN environment variable or pass it as the last argument.`);
  }
  
  const success = deploySubgraph(subgraph, subgraphName, accessToken);
  process.exit(success ? 0 : 1);
}

// Run if this file is executed directly
main();
