// 1. Need to get user input to slack channel
// 2. Need to check for Solved directory (true/false)
// 3. Need to either read/zip or just zip right away
// 4. Send file to Slack

import archiver from 'archiver';
import dotenv from 'dotenv';
import program from 'commander';
import fs from 'fs-extra';
import _ from 'highland';
import path from 'path';
import { WebClient } from '@slack/web-api';

import { classActivitiesChannel, bcampCliTestChannel } from '../channels';
import pkgJson from '../package.json';

dotenv.config({ path: '/Users/devinzimmerman/Bootcamp/bcamp-cli/.env' });

program
    .command('slack-solved <initial_comment>')
    .action(async initial_comment => {
        try {
            const solvedExists = await fs.pathExists(
                `${path.resolve()}/Solved/`
            );

            if (!solvedExists) {
                throw new Error('Solved directory not found');
            }

            const token = process.env.SLACK_TOKEN;

            const archive = archiver('zip', {
                zlib: {
                    level: 9
                }
            });

            archive.on('error', function (err) {
                throw err;
            });

            archive.directory(`${path.resolve()}/Solved/`, false);

            archive.finalize();

            const web = new WebClient(token);

            const res = await web.files.upload({
                channels: classActivitiesChannel,
                initial_comment,
                file: archive,
                filename: 'Solved.zip',
                filetype: 'zip'
            });

            console.log(res);
        } catch (err) {
            console.error(err);
        }
    });

program.parse(process.argv).version(pkgJson.version);
