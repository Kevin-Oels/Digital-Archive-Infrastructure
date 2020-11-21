#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { DigitalArchiveInfrastructureStack } from '../lib/digital-archive-infrastructure-stack';

const app = new cdk.App();
new DigitalArchiveInfrastructureStack(app, 'DigitalArchiveInfrastructureStack');
