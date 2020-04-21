export default class StringHandler {
    /**
     * @param originalString
     * @param value
     */
    public static replaceString(originalString: string, value: (string | number)[]): string {
        const REPLACE_SIGN_STRING = 's';
        const REPLACE_SIGN_INTEGER = 'i';
        const REPLACE_SIGN_JSON = 'j';
        const REPLACE_SIGN_RAW = 'r';

        let completedCause = '';
        let isReplaceSign = false;

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
                    default:
                        // REPLACE_SIGN_RAW:
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
            const words: string[] = str.split(' ');
            const termFreq: { [key: string]: number } = {};
            words.forEach(w => {
                termFreq[w] = (termFreq[w] || 0) + 1;
            });
            return termFreq;
        }

        function addKeysToDictionary(map: { [key: string]: number }, dictionary: { [key: string]: boolean }): void {
            for (const key of Object.keys(map)) {
                dictionary[key] = true;
            }
        }

        function termFreqMapToVector(map: { [key: string]: number }, dictionary: { [key: string]: boolean }): number[] {
            const termFreqVector: number[] = [];
            Object.keys(dictionary).forEach((term: string): void => {
                termFreqVector.push(map[term] || 0);
            });
            return termFreqVector;
        }

        function vecDotProduct(vecA: number[], vecB: number[]): number {
            let product = 0;
            for (let i = 0; i < vecA.length; i++) {
                product += vecA[i] * vecB[i];
            }
            return product;
        }

        function vecMagnitude(vec: number[]): number {
            let sum = 0;
            for (const item of vec) {
                sum += item * item;
            }
            return Math.sqrt(sum);
        }

        function cosineSimilarity(vecA: number[], vecB: number[]): number {
            return vecDotProduct(vecA, vecB) / (vecMagnitude(vecA) * vecMagnitude(vecB));
        }

        const termFreqA: { [key: string]: number } = termFreqMap(firstString);
        const termFreqB: { [key: string]: number } = termFreqMap(secondString);

        const dict: { [key: string]: boolean } = {};
        addKeysToDictionary(termFreqA, dict);
        addKeysToDictionary(termFreqB, dict);

        const termFreqVecA: number[] = termFreqMapToVector(termFreqA, dict);
        const termFreqVecB: number[] = termFreqMapToVector(termFreqB, dict);

        return cosineSimilarity(termFreqVecA, termFreqVecB);
    }

    /**
     * Upper case first character of string (not include trim string)
     * @param str
     */
    public static upperCaseFirstCharacter(str: string): string {
        return str.replace(
            /^[a-zàáâãèéêìíòóôõùúăđĩũơưạảấầẩẫậắằẳẵặẹẻẽềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]?/,
            (character): string => character.toUpperCase()
        );
    }
}
