/***/
export const replaceMetaDataString = (str: string, value: any[]): string => {
    const METADATA_KEY_STRING = 's';
    const METADATA_KEY_INTEGER = 'i';
    const METADATA_KEY_OBJECT = 'j';

    let completedCause = '';
    let isReplaceSign = false;

    str.split('').forEach((char: string, index: number): void => {
        if (char === '%') {
            isReplaceSign = true;
            return;
        }

        if (isReplaceSign) {
            switch (char) {
                case METADATA_KEY_INTEGER:
                    completedCause += `${Number(value.shift())}`;
                    break;
                case METADATA_KEY_STRING:
                    completedCause += `'${value.shift() || 'null'}'`;
                    break;
                case METADATA_KEY_OBJECT:
                    completedCause += `${
                        JSON.stringify(value.shift() || {}) || '{}'
                    }`;
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
};

/***/
export const calculateSimilarRate = (
    firstString: string,
    secondString: string
): number => {
    function termFreqMap(str: string): { [key: string]: number } {
        const words = str.split(' ');
        const termFreq: { [key: string]: number } = {};
        words.forEach((w) => {
            termFreq[w] = (termFreq[w] || 0) + 1;
        });
        return termFreq;
    }

    function addKeysToDictionary(
        map: { [key: string]: number },
        dictionary: { [key: string]: boolean }
    ): void {
        for (const key of Object.keys(map)) {
            dictionary[key] = true;
        }
    }

    function termFreqMapToVector(
        map: { [key: string]: number },
        dictionary: { [key: string]: boolean }
    ): number[] {
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
        return (
            vecDotProduct(vecA, vecB) /
            (vecMagnitude(vecA) * vecMagnitude(vecB))
        );
    }

    const termFreqA = termFreqMap(firstString);
    const termFreqB = termFreqMap(secondString);

    const dict: { [key: string]: boolean } = {};
    addKeysToDictionary(termFreqA, dict);
    addKeysToDictionary(termFreqB, dict);

    const termFreqVecA = termFreqMapToVector(termFreqA, dict);
    const termFreqVecB = termFreqMapToVector(termFreqB, dict);

    return cosineSimilarity(termFreqVecA, termFreqVecB);
};

/**
 * Get similar rate - min: 0 and max: 1
 */
export const getSimilarRate = (
    firstString: string,
    secondString: string
): number => {
    if (firstString === secondString) {
        return 1;
    }

    return calculateSimilarRate(
        removeBreakLineAndTrim(
            removeSpecialCharacter(firstString.toLowerCase())
        ),
        removeBreakLineAndTrim(
            removeSpecialCharacter(secondString.toLowerCase())
        )
    );
};

/**
 * Upper case first character of string (not include trim string)
 */
export const upperCaseFirstCharacter = (str: string): string => {
    return str.replace(
        /^[a-zàáâãèéêìíòóôõùúăđĩũơưạảấầẩẫậắằẳẵặẹẻẽềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]?/,
        (character): string => character.toUpperCase()
    );
};

export const removeBreakLineAndTrim = (str: string): string => {
    return str
        .replace(/\r|\n|\r\n/gm, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();
};

/**
 * Remove special character at head and tail of string.
 */
export const removeSpecialCharacterAtHeadAndTail = (str: string): string => {
    const STANDARD_ADDRESS_PATTERN = RegExp(
        /^[^\d\wÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]+|[^\d\wÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]+$/gi
    );

    return str.replace(STANDARD_ADDRESS_PATTERN, '');
};

/**
 * Remove special character exits at any position
 */
export const removeSpecialCharacter = (str: string): string => {
    return str.replace(
        RegExp(
            /[^a-z0-9A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]+/g
        ),
        ' '
    );
};
