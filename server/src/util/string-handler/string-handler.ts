export default class StringHandler {
    /**
     * @param originalString
     * @param value
     */
    public static replaceString(originalString: string, value: any[]): string {
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
            for (const term in dictionary) {
                if (map.hasOwnProperty(term)) {
                    termFreqVector.push(map[term]);
                } else {
                    termFreqVector.push(0);
                }
            }
            return termFreqVector;
        }

        function vecDotProduct(vecA: number[], vecB: number[]): number {
            let product: number = 0;
            for (let i = 0; i < vecA.length; i++) {
                product += vecA[i] * vecB[i];
            }
            return product;
        }

        function vecMagnitude(vec: number[]): number {
            let sum: number = 0;
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
        return str.replace(/[a-z]/, (character): string => character.toUpperCase());
    }
}
