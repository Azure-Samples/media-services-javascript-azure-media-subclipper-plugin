/**
 * Find the value in the querystring for a given key
 */
function findQueryString(key: string): string {
    var decodedUrl = decodeURIComponent(window.location.search);
    var result = decodedUrl.match(
        new RegExp("(\\?|&)" + key + "(\\[\\])?=([^&]*)")
        );

    return result ? result[3] : null;
}