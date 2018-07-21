context('unidirectional edges')

# h3_are_neighbours
test_that(
  'h3_are_neighbours returns correctly',
  c(
    expect_error(h3_are_neighbours('whereami', 'whoami')),
    expect_error(h3_are_neighbours('whereami')),
    expect_error(h3_are_neighbours('86be8d12fffffff',
                                   c('86be8d127ffffff', '86be8d107ffffff'))),
    val1 <- h3_are_neighbours('86be8d12fffffff', '86be8d127ffffff'),
    val2 <- h3_are_neighbours(c('86be8d12fffffff', '86be8d107ffffff'),
                              c('86be8d127ffffff', '86be8d10fffffff'),
                              simple = FALSE),
    expect_equal(val1, TRUE),
    expect_is(val2, 'data.frame'),
    expect_equal(names(val2), c('origin', 'destination', 'h3_neighbours')),
    expect_equal(nrow(val2), 2),
    expect_equal(val2$h3_neighbours, c(TRUE, TRUE))
  )
)

# h3_get_udedge
test_that(
  'h3_get_udedge returns correctly',
  c(
    expect_error(h3_get_udedge('whereami', 'whoami')),
    expect_error(h3_get_udedge('whereami')),
    expect_error(h3_get_udedge('86be8d12fffffff',
                               c('86be8d127ffffff', '86be8d107ffffff'))),
    val1 <- h3_get_udedge('86be8d12fffffff', '86be8d127ffffff'),
    val2 <- h3_get_udedge(c('86be8d12fffffff', '86be8d107ffffff'),
                          c('86be8d127ffffff', '86be8d10fffffff'),
                          simple = FALSE),
    expect_equal(val1, '166be8d12fffffff'),
    expect_is(val2, 'data.frame'),
    expect_equal(names(val2), c('origin', 'destination', 'h3_edge')),
    expect_equal(nrow(val2), 2),
    expect_equal(val2$h3_edge, c('166be8d12fffffff', '116be8d107ffffff'))
  )
)

# h3_is_edge_valid
test_that(
  'h3_is_edge_valid returns correctly',
  c(
    val1 <- h3_is_edge_valid(h3_edge = '166be8d12fffffff'),
    val2 <- h3_is_edge_valid(h3_edge = c('whereami', '166be8d12fffffff')),
    val3 <- h3_is_edge_valid(h3_edge = c('whereami', '166be8d12fffffff'),
                        simple = FALSE),
    expect_equal(val1, TRUE),
    expect_equal(val2, c(FALSE, TRUE)),
    expect_is(val3, 'data.frame'),
    expect_is(val3$h3_edge, 'character'),
    expect_equal(val3$h3_edge_valid, c(FALSE, TRUE))
  )
)

# h3_get_udorigin
test_that(
  'h3_get_udorigin returns correctly',
  c(
    expect_error(h3_get_udorigin('edgy')),
    val1 <- h3_get_udorigin('166be8d12fffffff'),
    val2 <- h3_get_udorigin('166be8d12fffffff', simple = FALSE),
    expect_equal(val1, '86be8d12fffffff'),
    expect_is(val2, 'data.frame'),
    expect_equal(names(val2), c('h3_edge', 'h3_origin')),
    expect_equal(val2$h3_origin, '86be8d12fffffff')
  )
)

# h3_get_uddest
test_that(
  'h3_get_uddest returns correctly',
  c(
    expect_error(h3_get_uddest('edgy')),
    val1 <- h3_get_uddest('166be8d12fffffff'),
    val2 <- h3_get_uddest('166be8d12fffffff', simple = FALSE),
    expect_equal(val1, '86be8d127ffffff'),
    expect_is(val2, 'data.frame'),
    expect_equal(names(val2), c('h3_edge', 'h3_destination')),
    expect_equal(val2$h3_destination, '86be8d127ffffff')
  )
)

# h3_get_udends
test_that(
  'h3_get_udends returns correctly',
  c(
    expect_error(h3_get_udends('edgy')),
    val1 <- h3_get_udends('166be8d12fffffff'),
    val2 <- h3_get_udends('166be8d12fffffff', simple = FALSE),
    expect_is(val1, 'matrix'),
    expect_equal(val1[1], '86be8d12fffffff'),
    expect_equal(val1[2], '86be8d127ffffff'),
    expect_is(val2, 'data.frame'),
    expect_equal(names(val2), c('h3_edge', 'origin', 'destination')),
    expect_equal(val2$origin, '86be8d12fffffff'),
    expect_equal(val2$destination, '86be8d127ffffff')
  )
)

# h3_get_udedges
test_that(
  'h3_get_udedges returns correctly',
  c(
    expect_error(h3_get_udedges('whereami')),
    val1 <- h3_get_udedges(h3_address = '86be8d12fffffff'),
    val2 <- h3_get_udedges(h3_address = '86be8d12fffffff', simple = FALSE),
    expect_equal(val1[[1]][1], '116be8d12fffffff'),
    expect_is(val2, 'data.frame'),
    expect_equal(names(val2), c('h3_address', 'h3_edges')),
    expect_is(val2$h3_edges, 'list'),
    expect_equal(val2$h3_edges[[1]][1], '116be8d12fffffff')
  )
)

# h3_to_geo_udedge
test_that(
  'h3_to_geo_udedge returns correctly',
  c(
    expect_error(h3_to_geo_udedge('edgy')),
    val1 <- h3_to_geo_udedge(h3_edge = '166be8d12fffffff'),
    val2 <- h3_to_geo_udedge(h3_edge = '166be8d12fffffff', simple = FALSE),
    expect_is(val1, 'sfc_LINESTRING'),
    expect_is(val2, 'sf'),
    expect_equal(sf::st_crs(val1)$epsg, 4326),
    expect_equal(names(val2), c('h3_edge', 'geometry')),
    expect_is(val2$geometry, 'sfc_LINESTRING'),
    expect_equal(val2$h3_edge, '166be8d12fffffff')
  )
)
