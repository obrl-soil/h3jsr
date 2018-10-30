context('H3 Algorithms')

test_that(
  'get_parent returns correctly',
  c(
    expect_error(get_parent(h3_address = 'whereami', res = 1)),
    expect_error(get_parent(h3_address = '8abe8d12acaffff', res = 20)),
    val1 <- get_parent(h3_address = '8abe8d12acaffff', res = 6),
    val2 <- get_parent(h3_address = '8abe8d12acaffff', res = 6,
                         simple = FALSE),
    expect_equal(val1, '86be8d12fffffff'),
    expect_is(val2, 'data.frame'),
    expect_is(val2$h3_address, 'character'),
    expect_is(val2$h3_res, 'integer'),
    expect_equal(val2$h3_parent, '86be8d12fffffff')
  )
)

test_that(
  'get_children returns correctly',
  c(
    expect_error(get_children(h3_address = 'whereami', res = 12)),
    expect_error(get_children(h3_address = '8abe8d12acaffff', res = 20)),
    val1 <- get_children(h3_address = '86be8d12fffffff', res = 8),
    val2 <- get_children(h3_address = '86be8d12fffffff', res = 8,
                         simple = FALSE),
    expect_equal(length(val1[[1]]), 49L),
    expect_equal(val1[[1]][1], '88be8d1281fffff'),
    expect_is(val2, 'data.frame'),
    expect_is(val2$h3_address, 'character'),
    expect_is(val2$h3_res, 'integer'),
    expect_equal(length(val2$h3_children[[1]]), 49L),
    expect_equal(val2$h3_children[[1]][1], '88be8d1281fffff')

  )
)

test_that(
  'get_kring returns correctly',
  c(
    expect_error(get_kring(h3_address = 'whereami', ring_size = 2)),
    val1 <- get_kring(h3_address = '86be8d12fffffff', ring_size = 2),
    val2 <- get_kring(h3_address = '86be8d12fffffff', ring_size = 2,
                           simple = FALSE),
    expect_is(val1, 'list'),
    expect_equal(length(val1[[1]]), 19L),
    expect_equal(val1[[1]][1], '86be8d12fffffff'),
    expect_is(val2, 'data.frame'),
    expect_is(val2$h3_address, 'character'),
    expect_is(val2$ring_size, 'integer'),
    expect_equal(length(val2$h3_kring[[1]]), 19L),
    expect_equal(val2$h3_kring[[1]][1], '86be8d12fffffff')

  )
)

test_that(
  'get_kring_list returns correctly',
  c(
    expect_error(get_kring_list(h3_address = 'whereami', ring_size = 2)),
    val1 <- get_kring_list(h3_address = '86be8d12fffffff', ring_size = 2),
    val2 <- get_kring_list(h3_address = '86be8d12fffffff', ring_size = 2,
                         simple = FALSE),
    expect_is(val1[[1]], 'list'),
    expect_equal(length(val1[[1]]), 3L),
    expect_equal(val1[[1]][[1]], '86be8d12fffffff'),
    expect_is(val2, 'data.frame'),
    expect_is(val2$h3_address, 'character'),
    expect_is(val2$ring_size, 'integer'),
    expect_equal(length(val2$h3_kringd[[1]]), 3L),
    expect_equal(val2$h3_kringd[[1]][[1]], '86be8d12fffffff')

  )
)

test_that(
  'get_ring returns correctly',
  c(
    expect_error(get_ring(h3_address = 'whereami', ring_size = 2)),
    val1 <- get_ring(h3_address = '86be8d12fffffff', ring_size = 2),
    val2 <- get_ring(h3_address = '86be8d12fffffff', ring_size = 2,
                         simple = FALSE),
    expect_equal(length(val1[[1]]), 12L),
    expect_equal(val1[[1]][1], '86be8d8f7ffffff'),
    expect_is(val2, 'data.frame'),
    expect_is(val2$h3_address, 'character'),
    expect_is(val2$ring_size, 'integer'),
    expect_equal(length(val2$h3_ring[[1]]), 12L),
    expect_equal(val2$h3_ring[[1]][1], '86be8d8f7ffffff')

  )
)

test_that(
  'polyfill returns correctly',
  c(
    expect_error(polyfill(geometry = 'a shape', res = 4)),
    nc <- sf::st_read(system.file("shape/nc.shp", package="sf")),
    nc1 <- nc[1, ],
    expect_error(polyfill(geometry = nc1, res = 20)),
    expect_message(polyfill(geometry = sf::st_transform(nc1, 4326), res = 10)),
    expect_message(polyfill(geometry = nc, res = 1)),
    val1 <- polyfill(geometry = nc1, res = 4),
    val2 <- polyfill(geometry = nc1, res = 4,
                        simple = FALSE),
    expect_equal(val1[[1]], '842a993ffffffff'),
    expect_is(val2, 'data.frame'),
    expect_is(val2, 'sf'),
    expect_is(val2$h3_polyfiller[[1]], 'character'),
    val3 <- polyfill(geometry = nc1, res = 1),
    expect_equal(val3[[1]], NA_character_)
  )
)

test_that(
  'set_to_multipolygon returns correctly',
  c(library(sf),
    bth <- sf::st_sfc(sf::st_point(c(153.023503, -27.468920)), crs = 4326),
    expect_error(set_to_multipolygon(h3_addresses = 'whereami')),
    val <- point_to_h3(bth, res = 10),
    val <- get_kring(h3_address = val, ring_size = 2),
    val1 <- set_to_multipolygon(unlist(val)),
    val2 <- set_to_multipolygon(unlist(val), simple = FALSE),
    expect_equal(val1, set_to_multipolygon(val)),
    expect_is(val1, 'sfc'),
    expect_is(val2, 'sf'),
    expect_is(val2$h3_addresses[[1]], 'character')
    )
)

test_that(
  'compact returns correctly',
  c(
    nc <- sf::st_read(system.file("shape/nc.shp", package="sf"), quiet = TRUE),
    nc1 <- nc[1, ],
    nc1 <- sf::st_cast(nc1, 'POLYGON'),
    fillers <- polyfill(geometry = nc1, res = 6),
    expect_error(compact(c('whereami', 'whoami'), res = 13)),
    val1 <- compact(fillers),
    val2 <- compact(fillers, simple = FALSE),
    expect_is(val1, 'character'),
    expect_equal(length(val1), 15L),
    expect_is(val2, 'list'),
    expect_equal(length(val2), 2L),
    expect_equal(length(val2[[1]]), 33L),
    expect_is(val2[[1]], 'character'),
    expect_equal(length(val2[[2]]), 15L),
    expect_is(val2[[2]], 'character')
  )
)

test_that(
  'uncompact returns correctly',
  c(
    nc <- sf::st_read(system.file("shape/nc.shp", package="sf"), quiet = TRUE),
    nc1 <- nc[1, ],
    nc1 <- sf::st_cast(nc1, 'POLYGON'),
    fillers <- polyfill(geometry = nc1, res = 6),
    comp <- compact(fillers),
    expect_error(uncompact(c('whereami', 'whoami'), res = 13)),
    expect_error(uncompact(fillers, res = 25)),
    val1 <- uncompact(fillers, res = 7),
    val2 <- uncompact(fillers, res = 7, simple = FALSE),
    expect_is(val1, 'character'),
    expect_equal(length(val1), 231L),
    expect_equal(length(val2[[1]]), 33L),
    expect_is(val2[[1]], 'character'),
    expect_equal(length(val2[[2]]), 231L),
    expect_is(val2[[2]], 'character')
  )
)

test_that(
  'grid_distance returns correctly',
  c(
    expect_error(grid_distance('whereami', 'whoami')),
    expect_error(grid_distance('whereami')),
    expect_error(grid_distance('86be8d12fffffff',
                             c('86be8d127ffffff', '86be8d107ffffff'))),
    val1 <- grid_distance('86be8d12fffffff', '86be8d127ffffff'),
    val2 <- grid_distance(c('86be8d12fffffff', '86be8d107ffffff', '86be8d127ffffff'),
                        c('86be8d127ffffff', '86be8d10fffffff', '86be8d10fffffff'),
                        simple = FALSE),
    expect_equal(val1, 1L),
    expect_is(val2, 'data.frame'),
    expect_equal(names(val2), c('origin', 'destination', 'grid_distance')),
    expect_equal(dim(val2)[1], 3),
    expect_equal(val2$grid_distance, c(1L, 1L, 2L))
  )
)
