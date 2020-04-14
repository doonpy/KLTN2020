export default interface PatternApiInterface {
    id: number | null;
    sourceUrl: string | null;
    mainLocator: {
        propertyType: string;
        title: string;
        price: string;
        acreage: string;
        address: string;
        postDate: {
            locator: string;
            format: string;
            delimiter: string;
        };
    } | null;
    subLocator:
        | [
              {
                  name: string;
                  locator: string;
              }
          ]
        | []
        | null;
    createAt: string | null;
    updateAt: string | null;
}
