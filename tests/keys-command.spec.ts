/**
 * Created by Phan Trung Nguyên.
 * User: nguyenpl117
 * Date: 3/29/2020
 * Time: 3:35 PM
 */
import {Application, ConsoleKernel} from "@tngraphql/illuminate";
import {join} from "path";
import {Filesystem} from "@poppinss/dev-utils/build";
import {KeysCommand} from "../src/command/KeysCommand";
import * as fssystem from "fs";

const fs = new Filesystem(join(__dirname, './command'))

describe('Keys Command', () => {
    let root;
    beforeEach(async () => {
        if (!await fs.exists(join(__dirname, './command'))) {
            fssystem.mkdirSync(join(__dirname, './command'), 755);
        }
        root = process.cwd();
        process.chdir(join(__dirname, './command'));
    })
    afterEach(async () => {
        process.chdir(root)
        jest.resetModules();
        await fs.cleanup();
    });

    it('should create the encryption keys for API authentication', async () => {
        const app = new Application(fs.basePath);
        app.environment = 'test';

        const kernel: ConsoleKernel = await app.make<ConsoleKernel>(ConsoleKernel);

        const cmd = new KeysCommand(app, kernel.getAce());

        await cmd.handle();

        expect(cmd.logger.logs[0]).toBe('Encryption keys generated successfully.');
    });

    it('should throw error when encryption keys already exist', async () => {
        const app = new Application(fs.basePath);
        app.environment = 'test';

        const kernel: ConsoleKernel = await app.make<ConsoleKernel>(ConsoleKernel);

        await new KeysCommand(app, kernel.getAce()).handle();

        const cmd = new KeysCommand(app, kernel.getAce());

        await cmd.handle();

        expect(cmd.logger.logs[0]).toBe('Encryption keys already exist. Use the --force option to overwrite them.');
    });

    it('should create the encryption keys when using --force', async () => {
        const app = new Application(fs.basePath);
        app.environment = 'test';

        const kernel: ConsoleKernel = await app.make<ConsoleKernel>(ConsoleKernel);

        await new KeysCommand(app, kernel.getAce()).handle();

        const cmd = new KeysCommand(app, kernel.getAce());
        cmd.force = true;

        await cmd.handle();

        expect(cmd.logger.logs[0]).toBe('Encryption keys generated successfully.');
    });
});
