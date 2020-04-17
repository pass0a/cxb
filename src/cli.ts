#!/usr/bin/env node
import * as minimist from 'minimist';
import { run } from './index';
let argv = minimist(process.argv.slice(2));
run(argv);
