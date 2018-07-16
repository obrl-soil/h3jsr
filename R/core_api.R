#' Convert point location to H3 address
#'
#' This function takes a latitude and longitude in WGS84 and returns a H3
#' address at the chosen resolution.
#' @param lon Number; Longitude in decimal degrees and WGS84 datum.
#' @param lat Number; Latitude in decimal degrees and WGS84 datum
#' @param res Integer; Desired H3 resolution. See
#'   https://uber.github.io/h3/#/documentation/core-library/resolution-table for
#'   allowable values and related dimensions.
#' @return A dataframe with input coordinates, resolution, and H3 address as
#'   columns.
#' @note You can supply multiple coordinates and resolutions as vectors, but
#'   they must be recyclable against each other as they are coerced into a data
#'   frame. It is safest to provide many points and one resolution, or one point
#'   and many resolutions.
#' @import V8
#' @examples
#' # where is the Brisbane Town Hall at resolution 15?
#' brisbane <- geo_to_h3(lon = 153.023503, lat = -27.468920, res = 15)
#'
#' # where is it at multiple resolutions?
#' brisbane_all <- geo_to_h3(lon = 153.023503, lat = -27.468920, res = seq(15))
#' @export
#'
geo_to_h3 <- function(lon = NULL, lat = NULL, res = NULL) {

  # Establish js interface
  sesh <- V8::v8()

  # load required js packages from bundle
  sesh$source(system.file('js', 'h3js_bundle.js', package = 'h3jsr'))

  # failproof
  if(!any(res %in% seq(15))) {
    return('Please provide a valid H3 resolution. Allowable values are 1-15 inclusive.')
  }

  # generate js code from input
  # note: might not be the fastest way
  eval_this <- data.frame('X' = lat, 'Y' = lon, 'res' = res,
                          stringsAsFactors = FALSE)

  # send df to js env as JSON. NB digits = NA is for toJSON(), to prevent
  # numerical precision loss
  sesh$assign('evalThis', eval_this, digits = NA)

  # do the thing
  sesh$eval('for (var i = 0; i < evalThis.length; i++) {
            evalThis[i].h3_address = h3.geoToH3(evalThis[i].Y, evalThis[i].X, evalThis[i].res);
            };')

  # retrieve the result
  sesh$get('evalThis')

  # ...?
  # Profit!
}
