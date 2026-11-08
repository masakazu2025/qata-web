// 親の契約 qata/contracts/openapi.yaml から生成した型。手で直さない。
// 生成し直す：npm run generate

export interface paths {
    "/apps": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 登録されているアプリ（部品の辞書）の一覧 */
        get: operations["listApps"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/apps/{app_id}/parts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** アプリの部品の辞書 */
        get: operations["getPartDictionary"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/testcases/validate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** テストケースを登録せずに検証する */
        post: operations["validateTestcase"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/testcases": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 登録されたテストケースの一覧（新しい順） */
        get: operations["listTestcases"];
        put?: never;
        /** テストケースを検証して登録する */
        post: operations["registerTestcase"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/testcases/{testcase_id}": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                testcase_id: components["parameters"]["testcase_id"];
            };
            cookie?: never;
        };
        /** テストケース一つ */
        get: operations["getTestcase"];
        put?: never;
        post?: never;
        /** テストケースを消す（実行の結果は残す） */
        delete: operations["deleteTestcase"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/testcases/{testcase_id}/approve": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                testcase_id: components["parameters"]["testcase_id"];
            };
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 人がテストケースを承認する（review_status を approved にする） */
        post: operations["approveTestcase"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/testcases/{testcase_id}/runs": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                testcase_id: components["parameters"]["testcase_id"];
            };
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** テストケースを実行する。実行が終わるまで待って結果を返す */
        post: operations["runTestcase"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/runs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 実行の結果の一覧（新しい順） */
        get: operations["listRuns"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/runs/{run_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 実行の結果一つ */
        get: operations["getRun"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/screenshots/{screenshot_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** スクショの PNG */
        get: operations["getScreenshot"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /**
         * @description 対象のアプリの ID。部品の辞書ごとに一つ。
         * @example calculator
         */
        app_id: string;
        /** @description 登録されているアプリ（部品の辞書）の一覧の一行。 */
        app_summary: {
            app_id: components["schemas"]["app_id"];
            name: string;
        };
        /**
         * @description 部品の辞書の中の、部品の名前。
         * @example 7
         * @example 足す
         * @example 等号
         * @example 表示
         */
        part_name: string;
        part: {
            /** @description 部品の説明（日本語）。AI がテストケースを作るときの手がかりにする。 */
            description?: string;
            /** @description この部品に使えるアクション。テストケースのステップの type と同じ名前。 */
            actions: ("press_key" | "tap" | "expect_text")[];
        };
        /**
         * PartDictionary
         * @description 画面の部品の辞書のうち、AI と web に見せる部分。部品の名前と、その部品に使えるアクションだけを持つ。名前を具体的な操作（キー・座標・読み取りの場所など）に変える規則は server の中の変換の枠に置き、契約には入れない（decisions.md の D14）。
         */
        "part-dictionary.schema": {
            app_id: components["schemas"]["app_id"];
            /**
             * @description アプリの表示名。
             * @example 電卓
             */
            name: string;
            /** @description 部品の名前をキーにした部品の一覧。名前が重ならないように、配列ではなくオブジェクトにする。 */
            parts: {
                [key: string]: components["schemas"]["part"];
            };
            $defs: {
                part: {
                    /** @description 部品の説明（日本語）。AI がテストケースを作るときの手がかりにする。 */
                    description?: string;
                    /** @description この部品に使えるアクション。テストケースのステップの type と同じ名前。 */
                    actions: ("press_key" | "tap" | "expect_text")[];
                };
            };
        };
        /** @description 失敗したときの理由。 */
        error: {
            code: string;
            /** @description 人が読む説明（日本語）。 */
            message: string;
        };
        /** @description API のエラーの本文。 */
        error_response: {
            error: components["schemas"]["error"];
        };
        /** @description このステップの説明（日本語）。人のレビューと結果の画面に出す。 */
        note: string;
        /** @description 部品のキーを押す。部品が press_key に対応していること。 */
        press_key: {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "press_key";
            part: components["schemas"]["part_name"];
            note?: components["schemas"]["note"];
        };
        /** @description 部品をタップする。部品が tap に対応していること。 */
        tap: {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "tap";
            part: components["schemas"]["part_name"];
            note?: components["schemas"]["note"];
        };
        /** @description 部品から読んだ値が expected と完全に一致することを確かめる。部品が expect_text に対応していること。PoC の確認事項はこの 1 種類だけ。 */
        expect_text: {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "expect_text";
            part: components["schemas"]["part_name"];
            expected: string;
            note?: components["schemas"]["note"];
        };
        step: components["schemas"]["press_key"] | components["schemas"]["tap"] | components["schemas"]["expect_text"];
        /**
         * Testcase
         * @description テストケース。AI が日本語の手順から作り、server に登録する。手順と確認事項を、実行する順に一つの列に並べる。部品は部品の辞書の名前で指す。
         */
        "testcase.schema": {
            app_id: components["schemas"]["app_id"];
            /** @description テストケースの名前（日本語）。 */
            title: string;
            /** @description 元になった日本語の手順と確認事項。人がレビューするときに、生成されたステップと見比べる。 */
            instruction: string;
            /** @description 実行の前に、人の確認を要るとするか（web のチェックボックス）。true なら、人が承認するまで実行できない。 */
            needs_review: boolean;
            /** @description 実行する順に並べたステップ。確認事項（expect_text）を少なくとも一つ含む。 */
            steps: components["schemas"]["step"][];
            $defs: {
                step: components["schemas"]["press_key"] | components["schemas"]["tap"] | components["schemas"]["expect_text"];
                /** @description 部品のキーを押す。部品が press_key に対応していること。 */
                press_key: {
                    /**
                     * @description discriminator enum property added by openapi-typescript
                     * @enum {string}
                     */
                    type: "press_key";
                    part: components["schemas"]["part_name"];
                    note?: components["schemas"]["note"];
                };
                /** @description 部品をタップする。部品が tap に対応していること。 */
                tap: {
                    /**
                     * @description discriminator enum property added by openapi-typescript
                     * @enum {string}
                     */
                    type: "tap";
                    part: components["schemas"]["part_name"];
                    note?: components["schemas"]["note"];
                };
                /** @description 部品から読んだ値が expected と完全に一致することを確かめる。部品が expect_text に対応していること。PoC の確認事項はこの 1 種類だけ。 */
                expect_text: {
                    /**
                     * @description discriminator enum property added by openapi-typescript
                     * @enum {string}
                     */
                    type: "expect_text";
                    part: components["schemas"]["part_name"];
                    expected: string;
                    note?: components["schemas"]["note"];
                };
                /** @description このステップの説明（日本語）。人のレビューと結果の画面に出す。 */
                note: string;
            };
        };
        /** @description テストケースの検証で見つかった問題一つ。 */
        validation_error: {
            /**
             * @description schema：形式が契約に合わない。unknown_app：部品の辞書がない。unknown_part：辞書にない部品。action_not_supported：その部品が、ステップのアクションに対応していない。
             * @enum {unknown}
             */
            code: "schema" | "unknown_app" | "unknown_part" | "action_not_supported";
            /** @description 問題のある場所。テストケースの中の JSON Pointer（例：/steps/2/part）。 */
            path: string;
            /** @description 人と AI が読む説明（日本語）。 */
            message: string;
        };
        validation_result: {
            valid: boolean;
            errors: components["schemas"]["validation_error"][];
        };
        /** @description server が振る ID。中身の形は server が決め、他の部品は不透明な文字列として扱う。 */
        id: string;
        /**
         * @description not_required：確認は要らない。pending：人の確認待ち（実行できない）。approved：人が承認した。
         * @enum {unknown}
         */
        review_status: "not_required" | "pending" | "approved";
        /**
         * Format: date-time
         * @description 日時。RFC 3339（タイムゾーン付き）。
         */
        timestamp: string;
        /** @description 登録されたテストケース。 */
        testcase_record: {
            id: components["schemas"]["id"];
            testcase: components["schemas"]["testcase.schema"];
            review_status: components["schemas"]["review_status"];
            created_at: components["schemas"]["timestamp"];
            updated_at: components["schemas"]["timestamp"];
        };
        run_step: {
            index: number;
            /** @description 実行したときのテストケースのステップの写し。 */
            step: components["schemas"]["step"];
            /**
             * @description passed：操作が済んだ、または確認事項が合った。failed：確認事項が合わない。error：このステップで実行できなくなった。skipped：前のエラーで実行しなかった。
             * @enum {unknown}
             */
            status: "passed" | "failed" | "error" | "skipped";
            /** @description expect_text で取り出した値。expect_text のときだけ。 */
            actual?: string;
            /** @description failed・error の説明（日本語）。 */
            message?: string;
            /** @description ステップのあとのスクショ。GET /screenshots/{screenshot_id} で PNG を取る。 */
            screenshot_id?: components["schemas"]["id"];
        };
        /** @description テストケースを一回実行した結果。 */
        run: {
            id: components["schemas"]["id"];
            testcase_id: components["schemas"]["id"];
            /**
             * @description passed：確認事項がすべて合った。failed：合わない確認事項があった。error：途中で実行できなくなった。
             * @enum {unknown}
             */
            status: "passed" | "failed" | "error";
            started_at: components["schemas"]["timestamp"];
            finished_at: components["schemas"]["timestamp"];
            error?: components["schemas"]["error"];
            /** @description テストケースの steps と同じ数・同じ順。 */
            steps: components["schemas"]["run_step"][];
        };
    };
    responses: {
        /** @description 見つからない */
        not_found: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["error_response"];
            };
        };
    };
    parameters: {
        app_id: components["schemas"]["app_id"];
        testcase_id: components["schemas"]["id"];
    };
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    listApps: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 一覧 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["app_summary"][];
                };
            };
        };
    };
    getPartDictionary: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                app_id: components["parameters"]["app_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 部品の辞書 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["part-dictionary.schema"];
                };
            };
            404: components["responses"]["not_found"];
        };
    };
    validateTestcase: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["testcase.schema"];
            };
        };
        responses: {
            /** @description 検証の結果（問題があっても 200 で返す） */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["validation_result"];
                };
            };
        };
    };
    listTestcases: {
        parameters: {
            query?: {
                app_id?: components["schemas"]["app_id"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 一覧 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["testcase_record"][];
                };
            };
        };
    };
    registerTestcase: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["testcase.schema"];
            };
        };
        responses: {
            /** @description 登録した */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["testcase_record"];
                };
            };
            /** @description 検証を通らなかった（登録しない） */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["validation_result"];
                };
            };
        };
    };
    getTestcase: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                testcase_id: components["parameters"]["testcase_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description テストケース */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["testcase_record"];
                };
            };
            404: components["responses"]["not_found"];
        };
    };
    deleteTestcase: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                testcase_id: components["parameters"]["testcase_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 消した */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            404: components["responses"]["not_found"];
        };
    };
    approveTestcase: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                testcase_id: components["parameters"]["testcase_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 承認した */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["testcase_record"];
                };
            };
            404: components["responses"]["not_found"];
            /** @description 確認の要らないテストケースだった（review_status が not_required） */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["error_response"];
                };
            };
        };
    };
    runTestcase: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                testcase_id: components["parameters"]["testcase_id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 実行した（結果が failed・error でも 201） */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["run"];
                };
            };
            404: components["responses"]["not_found"];
            /** @description 人の確認待ち（review_status が pending）で実行できない */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["error_response"];
                };
            };
            /** @description runner に届かない */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["error_response"];
                };
            };
        };
    };
    listRuns: {
        parameters: {
            query?: {
                testcase_id?: components["schemas"]["id"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 一覧 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["run"][];
                };
            };
        };
    };
    getRun: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                run_id: components["schemas"]["id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 実行の結果 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["run"];
                };
            };
            404: components["responses"]["not_found"];
        };
    };
    getScreenshot: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                screenshot_id: components["schemas"]["id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description PNG */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "image/png": string;
                };
            };
            404: components["responses"]["not_found"];
        };
    };
}
