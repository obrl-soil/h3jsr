context('prep_for_x methods')


test_that('prep_for_pt2h3.sf works',
          c(library(sf),
            nc <- sf::st_read(system.file("shape/nc.shp", package="sf"), quiet = TRUE),
            nc1 <- nc[1, ],
            expect_error(h3jsr:::prep_for_pt2h3(nc1)),
            no_crs_point <- sf::st_sf('geometry' = sf::st_sfc(sf::st_point(c(153,-27)))),
            expect_message(h3jsr:::prep_for_pt2h3(no_crs_point)),
            v1 <- h3jsr:::prep_for_pt2h3(no_crs_point),
            expect_equal(sf::st_crs(v1)$epsg, 4326)
          ))


test_that('prep_for_pt2h3.sfc works',
          c(library(sf),
            nc <- sf::st_read(system.file("shape/nc.shp", package="sf"), quiet = TRUE),
            nc1 <- sf::st_geometry(nc[1, ]),
            expect_error(h3jsr:::prep_for_pt2h3(nc1)),
            no_crs_point <- sf::st_sfc(sf::st_point(c(153,-27))),
            expect_message(h3jsr:::prep_for_pt2h3(no_crs_point)),
            v1 <- h3jsr:::prep_for_pt2h3(no_crs_point),
            expect_equal(sf::st_crs(v1)$epsg, 4326)
          ))

test_that('prep_for_pt2h3.sfg works',
          c(library(sf),
            nc <- sf::st_read(system.file("shape/nc.shp", package="sf"), quiet = TRUE),
            nc1 <- sf::st_geometry(nc[1, ])[[1]],
            expect_error(h3jsr:::prep_for_pt2h3(nc1))
          ))

test_that('prep_for_polyfill.sf works',
          c(library(sf),
           no_crs_poly <-
             sf::st_sf('geometry' = sf::st_sfc(
               sf::st_polygon(list(matrix(c(150, -30,
                                            151, -30,
                                            151, -35,
                                            150, -35,
                                            150, -30), ncol = 2, byrow = T))))),
           expect_message(h3jsr:::prep_for_polyfill(no_crs_poly)),
           v1 <- h3jsr:::prep_for_polyfill(no_crs_poly),
           expect_is(v1, 'geojson')
          ))

test_that('prep_for_polyfill.sf works',
          c(library(sf),
            no_crs_poly <-
              sf::st_sfc(
                sf::st_polygon(list(matrix(c(150, -30,
                                             151, -30,
                                             151, -35,
                                             150, -35,
                                             150, -30), ncol = 2, byrow = T)))),
            expect_message(h3jsr:::prep_for_polyfill(no_crs_poly)),
            v1 <- h3jsr:::prep_for_polyfill(no_crs_poly),
            expect_is(v1, 'geojson')
          ))


test_that(
  'prepped geojson returns correctly',
  c(
    nc <- sf::st_read(system.file("shape/nc.shp", package="sf"), quiet = TRUE),
    nc1 <- nc[1, ],
    val1 <- h3jsr:::prep_for_polyfill(nc1),
    val2 <- h3jsr:::prep_for_polyfill(sf::st_geometry(nc1)),
    nc1_84 <- sf::st_transform(nc1, 4326),
    val3 <-
      h3jsr:::prep_for_polyfill(sf::st_geometry(nc1_84)[[1]]),
    expect_is(val1, 'geojson'),
    expect_equal(val1, val2),
    expect_equal(val1, val3)
  )
)
