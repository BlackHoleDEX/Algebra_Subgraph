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

type DeploymentTarget = 'studio' | 'custom';

interface DeploymentConfig {
  target: DeploymentTarget;
  subgraphName: string;
  accessToken?: string;
  nodeUrl?: string;
  ipfsUrl?: string;
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

function deploySubgraph(
  subgraph: string, 
  config: DeploymentConfig
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
  
  console.log(`🚀 Deploying ${subgraph} subgraph (network: ${network}) to ${config.target}...`);
  console.log(`📍 Target: ${config.subgraphName}`);

  try {
    // Set up authentication based on target
    if (config.accessToken) {
      console.log(`🔑 Setting access token...`);
      
      if (config.target === 'studio') {
        execSync(`graph auth --studio ${config.accessToken}`, { 
          stdio: 'inherit',
          cwd: subgraphDir
        });
      }
    }
    
    // Deploy based on target
    let deployCommand: string;
    
    switch (config.target) {
      case 'studio':
        console.log(`📤 Deploying to The Graph Studio...`);
        deployCommand = `graph deploy ${config.subgraphName}`;
        break;
        
      case 'custom':
        console.log(`📤 Deploying to custom endpoint...`);
        if (!config.nodeUrl) {
          throw new Error('Node URL is required for custom deployment');
        }
        let customCommand = `graph deploy --node ${config.nodeUrl}`;
        if (config.ipfsUrl) {
          customCommand += ` --ipfs ${config.ipfsUrl}`;
        }
        customCommand += ` ${config.subgraphName}`;
        deployCommand = customCommand;
        break;
        
      default:
        throw new Error(`Unsupported deployment target: ${config.target}`);
    }
    
    execSync(deployCommand, { 
      stdio: 'inherit',
      cwd: subgraphDir
    });
    
    console.log(`✅ Successfully deployed ${subgraph} subgraph to ${config.target}`);
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
📖 Usage: yarn deploy-subgraph <subgraph> <target> <subgraph-name> [options]

📋 Available subgraphs: ${AVAILABLE_SUBGRAPHS.join(', ')}
📋 Available targets: studio, custom

📝 Examples:
  # Deploy to The Graph Studio
  yarn deploy-subgraph analytics studio algebra-analytics-base-sepolia
  
  # Deploy to custom endpoint
  yarn deploy-subgraph analytics custom my-subgraph --node http://localhost:8020 --ipfs http://localhost:5001 --access-token YOUR_TOKEN

� Options:
  --access-token <token>     Access token for authentication
  --node <url>        Graph node URL (required for custom target)
  --ipfs <url>        IPFS URL (optional for custom target)

�💡 The network will be automatically detected from the existing subgraph.yaml file.
   If subgraph.yaml doesn't exist, run: yarn prepare-network <network> first.

🔑 You can also set GRAPH_ACCESS_TOKEN environment variable instead of using --access-token .
    `);
    process.exit(1);
  }
  
  const [subgraph, target, subgraphName, ...options] = args;
  
  // Validate subgraph
  if (!AVAILABLE_SUBGRAPHS.includes(subgraph)) {
    console.error(`❌ Invalid subgraph: ${subgraph}`);
    console.log(`📋 Available subgraphs: ${AVAILABLE_SUBGRAPHS.join(', ')}`);
    process.exit(1);
  }
  
  // Validate target
  const validTargets: DeploymentTarget[] = ['studio', 'custom'];
  if (!validTargets.includes(target as DeploymentTarget)) {
    console.error(`❌ Invalid target: ${target}`);
    console.log(`📋 Available targets: ${validTargets.join(', ')}`);
    process.exit(1);
  }
  
  // Parse options
  const config: DeploymentConfig = {
    target: target as DeploymentTarget,
    subgraphName,
    accessToken: process.env.GRAPH_ACCESS_TOKEN
  };
  
  for (let i = 0; i < options.length; i++) {
    const option = options[i];
    switch (option) {
      case '--access-token':
        config.accessToken = options[i + 1];
        i++; // Skip next argument as it's the token value
        break;
      case '--node':
        config.nodeUrl = options[i + 1];
        i++; // Skip next argument as it's the node URL
        break;
      case '--ipfs':
        config.ipfsUrl = options[i + 1];
        i++; // Skip next argument as it's the IPFS URL
        break;
      default:
        console.warn(`⚠️  Unknown option: ${option}`);
    }
  }
  
  // Validate custom target requirements
  if (config.target === 'custom' && !config.nodeUrl) {
    console.error(`❌ Custom target requires --node URL`);
    process.exit(1);
  }
  
  if (!config.accessToken) {
    console.log(`⚠️  No access token provided. Make sure you're authenticated with The Graph CLI.`);
    console.log(`💡 You can set GRAPH_ACCESS_TOKEN environment variable or use --access-token option.`);
  }
  
  const success = deploySubgraph(subgraph, config);
  process.exit(success ? 0 : 1);
}

// Run if this file is executed directly
main();
