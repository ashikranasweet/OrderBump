import {
  Card,
  DataTable,
  Heading,
  Layout,
  Page,
  TextContainer,
  TextStyle,
  Tooltip,
} from "@shopify/polaris";
import React from "react";
import ApexChart from "../components/ApexChart";
const rows = [
  ["Manual", "$0.00"],
  ["Auto", "$0.00"],
];
const Analytics = () => {
  return (
    <Page>
      <Card sectioned>
        <TextContainer>
          <Heading>Analytics</Heading>
          <p>Track how Manual Bumps are doing against the Auto Bumps here</p>
        </TextContainer>
      </Card>
      <Card sectioned>
        <TextContainer>
          <Heading>OrderBump Revenue Overview</Heading>
          {/* Here is Apex Chart */}
          <ApexChart />
        </TextContainer>
      </Card>
      <br />
      <Layout>
        <Layout.Section oneHalf>
          <Card>
            <h1
              style={{
                padding: 10,
                paddingLeft: 15,
                fontSize: 18,
                letterSpacing: 1,
                fontWeight: "bold",
                borderBottom: "1px solid #ddd",
              }}
            >
              Lifetime Revenue
            </h1>
            <DataTable
              columnContentTypes={["text", "numeric"]}
              headings={[]}
              rows={rows}
              totals={["", "$0.00"]}
              hideScrollIndicator
            />
          </Card>
        </Layout.Section>
        <Layout.Section oneHalf>
          <Card>
            <h1
              style={{
                padding: 10,
                paddingLeft: 15,
                fontSize: 18,
                letterSpacing: 1,
                fontWeight: "bold",
                borderBottom: "1px solid #ddd",
              }}
            >
              30-day Revenue
            </h1>
            <DataTable
              columnContentTypes={["text", "numeric"]}
              headings={[]}
              rows={rows}
              totals={["", "$0.00"]}
              hideScrollIndicator
            />
          </Card>
        </Layout.Section>
      </Layout>
      <br />
      <Layout>
        <Layout.Section oneHalf>
          <Card>
            <h1
              style={{
                padding: 10,
                paddingLeft: 15,
                fontSize: 18,
                letterSpacing: 1,
                fontWeight: "bold",
                borderBottom: "1px solid #ddd",
              }}
            >
              <Tooltip
                dismissOnMouseOut
                content="Bumped orders (orders with successful bumps) divded by the total number of orders that were shown a bump on either the checkout or post-purchase page."
              >
                <TextStyle variation="strong">
                  <span
                    style={{
                      borderBottom: "1px dashed black",
                      paddingBottom: 5,
                    }}
                  >
                    % Bump Success
                  </span>
                </TextStyle>
              </Tooltip>
            </h1>
            <DataTable
              columnContentTypes={["text", "numeric"]}
              headings={[]}
              rows={rows}
              totals={["", "$0.00"]}
              hideScrollIndicator
            />
          </Card>
        </Layout.Section>
        <Layout.Section oneHalf>
          <Card>
            <h1
              style={{
                padding: 10,
                paddingLeft: 15,
                fontSize: 18,
                letterSpacing: 1,
                fontWeight: "bold",
                borderBottom: "1px solid #ddd",
              }}
            >
              <Tooltip
                dismissOnMouseOut
                content="Dollar amount increase in average order value (total value of all orders divided by the total number of orders) generated by OrderBump."
              >
                <TextStyle variation="strong">
                  <span
                    style={{
                      borderBottom: "1px dashed black",
                      paddingBottom: 5,
                    }}
                  >
                    Change in Average Order Value (AOV)
                  </span>
                </TextStyle>
              </Tooltip>
            </h1>
            <DataTable
              columnContentTypes={["text", "numeric"]}
              headings={[]}
              rows={rows}
              totals={["", "$0.00"]}
              hideScrollIndicator
            />
          </Card>
        </Layout.Section>
      </Layout>
      <br />
    </Page>
  );
};

export default Analytics;
