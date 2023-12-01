context('vertex functions')

test_that('is_valid_vertex returns correctly', {
  expect_false(is_valid_vertex('86be8d12fffffff'))
  expect_true(is_valid_vertex(h3_vertex = '25abe8d12ac87fff'))
})

test_that('get_cell_vertex returns correctly', {
  val1 <- get_cell_vertex('86be8d12fffffff', 0)
  expect_error(get_cell_vertex('whatever'))
  expect_error(get_cell_vertex('86be8d12fffffff', NA))
  expect_error(get_cell_vertex('86be8d12fffffff', seq(0, 5)))
  expect_equal(val1, '246be8d127ffffff')
})

test_that('get_cell_vertexes returns correctly', {
  val1 <- get_cell_vertexes('86be8d12fffffff')
  val2 <- get_cell_vertexes('86be8d12fffffff', simple = FALSE)
  expect_error(get_cell_vertexes('256be8d107ffffff'))
  expect_length(val1, 1)
  expect_length(val1[[1]], 6) # nb haven't checked on pentagon here
  expect_equal(val1[[1]][1], '246be8d127ffffff')
})

test_that('vertex_to_point returns correctly', {
  library(sf)
  val1 <- vertex_to_point('256be8d107ffffff')
  val2 <- vertex_to_point('256be8d107ffffff', simple = FALSE)
  val3 <- vertex_to_point(get_cell_vertexes('86be8d12fffffff')[[1]])
  val4 <- vertex_to_point(get_cell_vertexes('86be8d12fffffff')[[1]], simple = FALSE)
  val5 <- cell_to_polygon('86be8d12fffffff', simple = FALSE)
  val6 <- all(sapply(sf::st_intersects(val4, val5), function(i) {i == 1}))
  expect_error(vertex_to_point('86be8d12fffffff'))
  expect_length(val1, 1)
  expect_is(val1, 'sfc_POINT')
  expect_is(val2, 'sf')
  expect_is(val3, 'sfc_POINT')
  expect_is(val4, 'sf')
  expect_true(val6) # all points intersect their parent hex
  expect_equal(val1[[1]][1], 153.0433070159652118036)
})
