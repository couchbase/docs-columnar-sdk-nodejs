const columnar = require('couchbase-columnar')


async function main() {
    const clusterConnStr = 'couchbases://--your-instance--'
    const username = 'username'
    const password = 'Password123!'

    const credential = new columnar.Credential(username, password)
    const cluster = columnar.createInstance(clusterConnStr, credential, {
        securityOptions: {
            disableServerCertificateVerification: true
        }
    })

{
    // #tag::sqlpp_scope_query[]
    const scope = cluster.database('travel-sample').scope('inventory')

    let qs =
        `
        SELECT airline, COUNT(*) AS route_count, AVG(route.distance) AS avg_route_distance
        FROM route
        WHERE sourceairport = $sourceAirport AND distance >= $1
        GROUP BY airline
        ORDER BY route_count DESC
        `

    let res = await scope.executeQuery(qs, {
        positionalParameters: [1000],
        namedParameters: {sourceAirport: 'SFO'}
    })

    for await (let row of res.rows()) {
        console.log(row)
    }

    console.log('Metadata: ', res.metadata())
    // #end::sqlpp_scope_query[]
}
{
    // #tag::sqlpp_cluster_query[]
    let qs =
        `
        SELECT r.airline, COUNT(*) AS route_count, AVG(r.distance) AS avg_route_distance
        FROM \`travel-sample\`.\`inventory\`.\`route\` AS r
        WHERE r.sourceairport = $sourceAirport AND r.distance >= $1
        GROUP BY r.airline
        ORDER BY route_count DESC
        `

    let res = await cluster.executeQuery(qs, {
        positionalParameters: [1000],
        namedParameters: {sourceAirport: 'SFO'}
    })

    for await (let row of res.rows()) {
        console.log(row)
    }

    console.log('Metadata: ', res.metadata())
    // #end::sqlpp_cluster_query[]

}


}

main()
    .catch((err) => {
        console.log('ERR:', err)
        process.exit(1)
    })
    .then(process.exit)