
let demo_code =
`
var separation_weight: 0.1
var alignment_weight: 0.1
var cohesion_weight: 0.1
var neighbours_distance: 0.25

agent flock:
    boids: Array<boid>(25)
    +> x: find_neighbours(x, boids) >
    +> init: update >
    +> update: draw() sleep(10) update >

agent boid:
    x: {x: 0, y: 0}
    v: {x: 0, y: 0}
    +> init: update >
    +> update:
        x -> flock +> neighbours
            separation(x, v, neighbours)
            align(x, neighbours)
            align(v, neighbours)
            {% x.add(v) %}
                x, v -> sim_space +> x, v
                    sleep(10) update >

agent sim_space:
    width: 1.0
    height: 1.0
    +> x, v:
        limit(x, v, 'x')
        limit(x, v, 'y')
            x, v >

`
