context('prep_for_polyfill methods')

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
