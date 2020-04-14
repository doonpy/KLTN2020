export default class StringHandler {
    /**
     * @param originalString
     * @param value
     */
    public static replaceString(originalString: string, value: Array<any>): string {
        const REPLACE_SIGN_STRING: string = 's';
        const REPLACE_SIGN_INTEGER: string = 'i';
        const REPLACE_SIGN_JSON: string = 'j';
        const REPLACE_SIGN_RAW: string = 'r';

        let completedCause: string = '';
        let isReplaceSign: boolean = false;

        originalString.split('').forEach((char: string, index: number): void => {
            if (char === '%') {
                isReplaceSign = true;
                return;
            }

            if (isReplaceSign) {
                switch (char) {
                    case REPLACE_SIGN_INTEGER:
                        completedCause += `${Number(value.shift())}`;
                        break;
                    case REPLACE_SIGN_STRING:
                        completedCause += `'${value.shift() || 'null'}'`;
                        break;
                    case REPLACE_SIGN_JSON:
                        completedCause += `${JSON.stringify(value.shift() || {}) || '{}'}`;
                        break;
                    case REPLACE_SIGN_RAW:
                        completedCause += `${value.shift() || ''}`;
                }
                isReplaceSign = false;
            } else {
                completedCause += char;
            }
        });

        return completedCause;
    }

    /**
     * @param rawText
     * @param pattern
     *
     * @return string
     */
    public static cleanText(rawText: string, pattern: RegExp): string {
        return rawText.replace(pattern, '');
    }

    /**
     * Get similar rate - min: 0 and max: 1
     * @param {string} firstString
     * @param {string} secondString
     * @return number
     */
    public static getSimilarRate(firstString: string, secondString: string): number {
        if (firstString === secondString) {
            return 1;
        }

        const cleanRegExp = new RegExp(
            /[^a-z0-9A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s]+/g
        );
        firstString = StringHandler.cleanText(firstString, cleanRegExp)
            .replace(/\s+/g, ' ')
            .toLowerCase();
        secondString = StringHandler.cleanText(secondString, cleanRegExp)
            .replace(/\s+/g, ' ')
            .toLowerCase();

        return this.calculateSimilarRate(firstString, secondString);
    }

    /**
     * @param {string} firstString
     * @param {string} secondString
     * @return {number}
     */
    private static calculateSimilarRate(firstString: string, secondString: string): number {
        function termFreqMap(str: string): { [key: string]: number } {
            let words: Array<string> = str.split(' ');
            let termFreq: { [key: string]: number } = {};
            words.forEach(w => {
                termFreq[w] = (termFreq[w] || 0) + 1;
            });
            return termFreq;
        }

        function addKeysToDict(map: { [key: string]: number }, dict: { [key: string]: boolean }): void {
            for (const key in map) {
                dict[key] = true;
            }
        }

        function termFreqMapToVector(map: { [key: string]: number }, dict: { [key: string]: boolean }): Array<number> {
            let termFreqVector: Array<number> = [];
            for (const term in dict) {
                termFreqVector.push(map[term] || 0);
            }
            return termFreqVector;
        }

        function vecDotProduct(vecA: Array<number>, vecB: Array<number>): number {
            let product: number = 0;
            for (let i = 0; i < vecA.length; i++) {
                product += vecA[i] * vecB[i];
            }
            return product;
        }

        function vecMagnitude(vec: Array<number>): number {
            let sum: number = 0;
            for (let i = 0; i < vec.length; i++) {
                sum += vec[i] * vec[i];
            }
            return Math.sqrt(sum);
        }

        function cosineSimilarity(vecA: Array<number>, vecB: Array<number>): number {
            return vecDotProduct(vecA, vecB) / (vecMagnitude(vecA) * vecMagnitude(vecB));
        }

        const termFreqA: { [key: string]: number } = termFreqMap(firstString);
        const termFreqB: { [key: string]: number } = termFreqMap(secondString);

        let dict: { [key: string]: boolean } = {};
        addKeysToDict(termFreqA, dict);
        addKeysToDict(termFreqB, dict);

        const termFreqVecA: Array<number> = termFreqMapToVector(termFreqA, dict);
        const termFreqVecB: Array<number> = termFreqMapToVector(termFreqB, dict);

        return cosineSimilarity(termFreqVecA, termFreqVecB);
    }

    /**
     * Upper case first character of string (not include trim string)
     * @param string
     */
    public static upperCaseFirstCharacter(string: string): string {
        return string.replace(/[a-z]/, (character): string => character.toUpperCase());
    }
}
