context('unidirectional edges')

test_that('are_neighbours returns correctly', {
  expect_error(are_neighbours('whereami', 'whoami'))
  expect_error(are_neighbours('86be8d12fffffff'))
  expect_error(are_neighbours('86be8d12fffffff',
                              c('86be8d127ffffff', '86be8d107ffffff')))
  val1 <- are_neighbours('86be8d12fffffff', '86be8d127ffffff')
  val2 <- are_neighbours(c('86be8d12fffffff', '86be8d107ffffff', '86be8d127ffffff'),
                         c('86be8d127ffffff', '86be8d10fffffff', '86be8d10fffffff'),
                         simple = FALSE)
  expect_equal(val1, TRUE)
  expect_is(val2, 'data.frame')
  expect_equal(names(val2), c('origin', 'destination', 'h3_neighbours'))
  expect_equal(dim(val2)[1], 3)
  expect_equal(val2$h3_neighbours, c(TRUE, TRUE, FALSE))
})

test_that('get_udedge returns correctly', {
  expect_error(get_udedge('whereami', 'whoami'))
  expect_error(get_udedge('86be8d12fffffff'))
  expect_error(get_udedge('86be8d12fffffff',
                          c('86be8d127ffffff', '86be8d107ffffff')))
  val1 <- get_udedge('86be8d12fffffff', '86be8d127ffffff')
  val2 <- get_udedge(c('86be8d12fffffff', '86be8d107ffffff'),
                     c('86be8d127ffffff', '86be8d10fffffff'),
                     simple = FALSE)
  expect_equal(val1, '166be8d12fffffff')
  expect_is(val2, 'data.frame')
  expect_equal(names(val2), c('origin', 'destination', 'h3_edge'))
  expect_equal(dim(val2)[1], 2)
  expect_equal(val2$h3_edge, c('166be8d12fffffff', '116be8d107ffffff'))
})

test_that('is_valid_edge returns correctly', {
  val1 <- is_valid_edge(h3_edge = '166be8d12fffffff')
  val2 <- is_valid_edge(h3_edge = c('whereami', '166be8d12fffffff'))
  val3 <- is_valid_edge(h3_edge = c('whereami', '166be8d12fffffff'),
                        simple = FALSE)
  expect_equal(val1, TRUE)
  expect_equal(val2, c(FALSE, TRUE))
  expect_is(val3, 'data.frame')
  expect_is(val3$h3_edge, 'character')
  expect_equal(val3$h3_edge_valid, c(FALSE, TRUE))
})

test_that('get_udorigin returns correctly', {
  expect_error(get_udorigin('edgy'))
  val1 <- get_udorigin('166be8d12fffffff')
  val2 <- get_udorigin('166be8d12fffffff', simple = FALSE)
  expect_equal(val1, '86be8d12fffffff')
  expect_is(val2, 'data.frame')
  expect_equal(names(val2), c('h3_edge', 'h3_origin'))
  expect_equal(val2$h3_origin, '86be8d12fffffff')
})

test_that('get_uddest returns correctly', {
  expect_error(get_uddest('edgy'))
  val1 <- get_uddest('166be8d12fffffff')
  val2 <- get_uddest('166be8d12fffffff', simple = FALSE)
  expect_equal(val1, '86be8d127ffffff')
  expect_is(val2, 'data.frame')
  expect_equal(names(val2), c('h3_edge', 'h3_destination'))
  expect_equal(val2$h3_destination, '86be8d127ffffff')
})

test_that('get_udends returns correctly', {
  expect_error(get_udends('edgy'))
  val1 <- get_udends('166be8d12fffffff')
  val2 <- get_udends('166be8d12fffffff', simple = FALSE)
  expect_is(val1, 'list')
  expect_equal(val1[[1]][1], '86be8d12fffffff')
  expect_is(val2, 'data.frame')
  expect_equal(names(val2), c('h3_edge', 'h3_ends'))
  expect_is(val2$h3_ends, 'list')
  expect_equal(val2$h3_ends[[1]][1], '86be8d12fffffff')
})

test_that('get_udedges returns correctly', {
  expect_error(get_udedges('whereami'))
  val1 <- get_udedges(h3_address = '86be8d12fffffff')
  val2 <- get_udedges(h3_address = '86be8d12fffffff', simple = FALSE)
  expect_equal(val1[[1]][1], '116be8d12fffffff')
  expect_is(val2, 'data.frame')
  expect_equal(names(val2), c('h3_address', 'h3_edges'))
  expect_is(val2$h3_edges, 'list')
  expect_equal(val2$h3_edges[[1]][1], '116be8d12fffffff')
})

test_that('udedge_to_line returns correctly', {
  expect_error(udedge_to_line('edgy'))
  val1 <- udedge_to_line(h3_edge = '166be8d12fffffff')
  val2 <- udedge_to_line(h3_edge = '166be8d12fffffff', simple = FALSE)
  expect_is(val1, 'sfc_LINESTRING')
  expect_is(val2, 'sf')
  expect_equal(sf::st_crs(val1)$epsg, 4326)
  expect_equal(names(val2), c('h3_edge', 'geometry'))
  expect_is(val2$geometry, 'sfc_LINESTRING')
  expect_equal(val2$h3_edge, '166be8d12fffffff')
})
