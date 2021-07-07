/// <reference path="../src/install.ts" />

/// <reference types="../index" />

import { expect } from "chai";
import { readdir, readFile } from "fs/promises";
import * as sinon from "sinon";
import { transpile, TranspileOptions } from "typescript";
import { createContext, runInContext } from "vm";

type TestGlobal = Mocha.Context & {
    TriggersApp: GoogleAppsScript.Triggers.TriggersApp;
};

describe("TriggersApp", () => {
    before(async () => {
        const base = "./src";

        const paths = await readdir(base);

        const ts = await Promise.all(
            paths.map((p) => readFile(`${base}/${p}`, { encoding: "utf-8" }))
        );

        const tsconf = await readFile("./tsconfig.json", { encoding: "utf-8" });

        const { compilerOptions }: TranspileOptions = JSON.parse(tsconf);

        const ctxt = createContext({});

        const js = ts.map((c) => transpile(c, compilerOptions));
        js.forEach((file) => runInContext(file, ctxt));

        Object.assign(this, { TriggersApp: ctxt });
    });

    it("should correctly determine hourly range", () => {
        const { TriggersApp } = <TestGlobal>this;

        const hour = new Date().getHours();

        const isIn = TriggersApp.isInHourlyRange({ hour });
        const isInRng = TriggersApp.isInHourlyRange({
            hour,
            start: hour - 2,
            end: hour + 2,
        });
        const isInOutRng = TriggersApp.isInHourlyRange({
            start: 0,
            end: 1,
            hour: 2,
        });

        expect(isIn).to.be.true;
        expect(isInRng).to.be.true;
        expect(isInOutRng).to.be.false;
    });

    describe("listing triggers", () => {
        describe("listTrackedTriggers", () => {
            it("should throw if properties service is not set", () => {
                const { TriggersApp } = <TestGlobal>this;
                expect(TriggersApp.listTrackedTriggers).to.throw();
            });
            it("should not throw if properties service is set", () => {
                const { TriggersApp } = <TestGlobal>this;

                const fakeStore = { getKeys: sinon.fake(() => []) };

                const PropertiesService = {
                    getDocumentProperties: sinon.fake(() => fakeStore),
                    getScriptProperties: sinon.fake(() => fakeStore),
                    getUserProperties: sinon.fake(() => fakeStore),
                };

                TriggersApp.use(PropertiesService);

                const triggers = TriggersApp.listTrackedTriggers();
                expect(triggers).to.be.empty;
            });
        });
    });
});