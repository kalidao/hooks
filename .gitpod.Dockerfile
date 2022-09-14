FROM gitpod/workspace-full

# Install Foundry
RUN sudo curl -L https://foundry.paradigm.xyz | bash \
  && foundryup
