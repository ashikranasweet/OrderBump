import { Banner, Card, Layout, Page } from "@shopify/polaris";
import React from "react";
import SingleBump from "../components/SingleBump";

const ManualBump = () => {
  return (
    <Page>
      <Layout>
        {/* Banner one */}
        <Layout.Section>
          <Banner
            title="Looks like you haven’t added the checkout code snippet yet."
            onDismiss={() => {}}
            status="warning"
          >
            <p>
              Your checkout widget won’t show up until you do. Follow these
              instructions to get started.
            </p>
          </Banner>
        </Layout.Section>

        {/* Manual Bumps title */}
        <Layout.Section>
          <Card title="Manual Bumps" sectioned>
            <p>Manage the bumps that you manually set up here</p>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <SingleBump />
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default ManualBump;
